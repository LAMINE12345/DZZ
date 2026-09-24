'use client';

import * as React from 'react';
import { useAppStore } from '@/src/core/store';
import { Collection } from '@/src/core/types';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Button } from '@/src/shared/ui';

interface CsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection;
  defaultTab?: 'import' | 'export';
}

function CsvModalContent({
  onClose,
  collection,
  defaultTab = 'import',
}: CsvModalProps) {
  const { importEntriesFromCSV, addToast } = useAppStore();
  const [tab, setTab] = React.useState<'import' | 'export'>(defaultTab);
  const [csvText, setCsvText] = React.useState('');
  const [parsedRows, setParsedRows] = React.useState<Record<string, any>[]>([]);
  const [parseError, setParseError] = React.useState<string | null>(null);

  // Téléchargement du Template CSV
  const handleDownloadTemplate = () => {
    const headers = collection.fields.map((f) => f.key || f.name.toLowerCase()).join(',');
    const sampleRow = collection.fields
      .map((f) => {
        if (f.type === 'number') return '99';
        if (f.type === 'boolean') return 'true';
        if (f.type === 'date') return '2026-03-23';
        if (f.type === 'image') return 'https://picsum.photos/800/600';
        return `Exemple ${f.name}`;
      })
      .join(',');

    const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(
      `${headers}\n${sampleRow}\n`
    )}`;

    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `template_${collection.slug || 'collection'}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Exporter les données réelles en CSV
  const handleExportData = () => {
    const fieldKeys = collection.fields.map((f) => f.key || f.name.toLowerCase());
    const headerLine = fieldKeys.join(';');

    const rows = collection.entries.map((entry) =>
      fieldKeys
        .map((k) => {
          const raw = entry[k] ?? '';
          const escaped = String(raw).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(';')
    );

    const fullCsv = [headerLine, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + fullCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${collection.slug || 'donnees'}_export.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    addToast({
      type: 'success',
      title: 'Export CSV réussi ! 📊',
      message: `${collection.entries.length} lignes exportées.`,
    });
    onClose();
  };

  // Parsing CSV texte
  const parseCSV = (text: string) => {
    try {
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length < 2) {
        setParseError('Le fichier CSV doit comporter au moins un en-tête et une ligne de données.');
        setParsedRows([]);
        return;
      }

      // Détection du séparateur (, ou ;)
      const delimiter = lines[0].includes(';') ? ';' : ',';
      const headers = lines[0].split(delimiter).map((h) => h.replace(/^["']|["']$/g, '').trim());

      const items: Record<string, any>[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Simple CSV splitter respecting basic quotes
        const rawCols = lines[i].split(delimiter);
        const item: Record<string, any> = {};

        headers.forEach((h, colIdx) => {
          let val: any = rawCols[colIdx]?.replace(/^["']|["']$/g, '').trim() ?? '';
          if (val.toLowerCase() === 'true') val = true;
          if (val.toLowerCase() === 'false') val = false;
          if (val !== '' && !isNaN(Number(val)) && !val.startsWith('0')) {
            val = Number(val);
          }
          item[h] = val;
        });

        items.push(item);
      }

      setParsedRows(items);
      setParseError(null);
    } catch (err) {
      setParseError('Impossible d’analyser le format CSV. Vérifiez vos délimiteurs.');
      setParsedRows([]);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvText(content);
      parseCSV(content);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    importEntriesFromCSV(collection.id, parsedRows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#181824] rounded-2xl shadow-2xl border border-[#E6E6EE] dark:border-[#28283C] w-full max-w-2xl flex flex-col overflow-hidden">
        {/* En-tête avec onglets Import / Export */}
        <div className="px-6 py-4 border-b border-[#E6E6EE] dark:border-[#28283C] flex items-center justify-between shrink-0 bg-[#FAFAFC] dark:bg-[#1E1E2D]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5B5BF0]/10 text-[#5B5BF0] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Import / Export CSV
              </h2>
              <p className="text-xs text-[#62627A] dark:text-[#A5A5BC]">
                Collection : <span className="font-semibold">{collection.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#62627A] dark:text-[#A5A5BC] hover:bg-[#EAEAEA] dark:hover:bg-[#28283C] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barre d'onglets */}
        <div className="px-6 pt-3 border-b border-[#E6E6EE] dark:border-[#28283C] flex gap-4 bg-white dark:bg-[#181824]">
          <button
            type="button"
            onClick={() => setTab('import')}
            className={`pb-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'import'
                ? 'border-[#5B5BF0] text-[#5B5BF0]'
                : 'border-transparent text-[#62627A] hover:text-[#1B1B2F] dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importer des données</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('export')}
            className={`pb-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'export'
                ? 'border-[#5B5BF0] text-[#5B5BF0]'
                : 'border-transparent text-[#62627A] hover:text-[#1B1B2F] dark:hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter le catalogue</span>
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-4">
          {tab === 'import' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#62627A] dark:text-[#A5A5BC]">
                  Téléchargez un modèle CSV conforme ou importez directement votre fichier.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Modèle CSV</span>
                </Button>
              </div>

              {/* Upload de fichier */}
              <label className="border-2 border-dashed border-[#E6E6EE] dark:border-[#28283C] hover:border-[#5B5BF0] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#FAFAFC] dark:bg-[#1E1E2D]">
                <Upload className="w-6 h-6 text-[#5B5BF0] mb-2" />
                <span className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                  Cliquez pour choisir un fichier .csv
                </span>
                <span className="text-[11px] text-[#82829A] mt-1">
                  Délimiteurs virgule (,) ou point-virgule (;) supportés
                </span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </label>

              {/* Zone de texte manuelle */}
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Ou collez directement votre texte CSV :
                </label>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    parseCSV(e.target.value);
                  }}
                  placeholder="nom;prix;description&#10;Sac Voyage;99;Superbe sac..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[#F7F7FA] dark:bg-[#202030] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0] resize-none"
                />
              </div>

              {parseError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {parsedRows.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{parsedRows.length} lignes prêtes à être importées</span>
                  </div>
                  <Button size="sm" onClick={handleConfirmImport}>
                    Confirmer l’import
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAFAFC] dark:bg-[#1E1E2D] border border-[#E6E6EE] dark:border-[#28283C] flex items-center gap-3">
                <FileText className="w-8 h-8 text-[#5B5BF0] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Exportation complète : {collection.name}
                  </h4>
                  <p className="text-xs text-[#62627A] dark:text-[#A5A5BC]">
                    {collection.entries.length} entrées et {collection.fields.length} colonnes seront exportées au format CSV standard UTF-8.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Annuler
                </Button>
                <Button size="sm" onClick={handleExportData} className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger le fichier .csv</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CsvModal(props: CsvModalProps) {
  if (!props.isOpen) return null;
  return <CsvModalContent key={`${props.collection.id}-${props.defaultTab || 'import'}`} {...props} />;
}
