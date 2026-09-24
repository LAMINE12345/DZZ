'use client';

import * as React from 'react';
import { useAppStore } from '@/src/core/store';
import { compileGraphToJavaScript } from '@/src/core/compiler';
import { SourceMapping, CompileDiagnostic } from '@/src/core/compiler/types';
import { Modal, Button } from '@/src/shared/ui';
import {
  Code2,
  Copy,
  Check,
  Download,
  Sparkles,
  AlertTriangle,
  XCircle,
  Info,
  BookOpen,
  Zap,
  Terminal,
  FileCode,
} from 'lucide-react';

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNodeId?: string;
  onSelectNode?: (nodeId: string) => void;
}

export function CodeViewerModal({
  isOpen,
  onClose,
  selectedNodeId,
  onSelectNode,
}: CodeViewerModalProps) {
  const { project, activePageId, addToast } = useAppStore();
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'code' | 'diagnostics'>('code');
  const [hoveredLine, setHoveredLine] = React.useState<number | null>(null);
  const [selectedLine, setSelectedLine] = React.useState<number | null>(null);

  const activePage = project.pages.find((p) => p.id === activePageId) || project.pages[0];
  const activeGraph = activePage?.graphs?.[0];

  const compileResult = React.useMemo(() => {
    const nodes = activeGraph?.nodes || [];
    const edges = activeGraph?.edges || [];
    const elements = activePage?.root ? [activePage.root] : [];
    return compileGraphToJavaScript(nodes, edges, elements, activePage?.name || 'Page');
  }, [activeGraph, activePage]);

  // Si un nœud est sélectionné de l'extérieur, on cible sa première ligne
  React.useEffect(() => {
    if (selectedNodeId && compileResult.sourceMappings) {
      const mapping = compileResult.sourceMappings.find((m) => m.nodeId === selectedNodeId);
      if (mapping) {
        const timer = setTimeout(() => setSelectedLine(mapping.startLine), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedNodeId, compileResult.sourceMappings]);

  const lines = React.useMemo(() => {
    return compileResult.code.split('\n');
  }, [compileResult.code]);

  const activeMapping: SourceMapping | undefined = React.useMemo(() => {
    const targetLine = hoveredLine || selectedLine;
    if (!targetLine) return undefined;
    return compileResult.sourceMappings.find(
      (m) => targetLine >= m.startLine && targetLine <= m.endLine
    );
  }, [hoveredLine, selectedLine, compileResult.sourceMappings]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(compileResult.code);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Code copié dans le presse-papier !',
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([compileResult.code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePage?.slug || 'page'}-logic.js`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'info',
      title: 'Fichier .js téléchargé',
      duration: 2000,
    });
  };

  const errorCount = compileResult.diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = compileResult.diagnostics.filter((d) => d.severity === 'warning').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Code JavaScript Généré (Lecture Seule)"
      size="xl"
    >
      <div className="flex flex-col gap-3 max-h-[80vh]">
        {/* Entête avec onglets et actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E6E6EE] dark:border-[#28283C]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-[#5B5BF0] text-white shadow-xs'
                  : 'bg-[#F1F1F6] dark:bg-[#1E1E2C] text-[#62627A] dark:text-[#A5A5BC]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>JavaScript ({compileResult.astSummary.totalLines} lignes)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('diagnostics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'diagnostics'
                  ? 'bg-[#5B5BF0] text-white shadow-xs'
                  : 'bg-[#F1F1F6] dark:bg-[#1E1E2C] text-[#62627A] dark:text-[#A5A5BC]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Diagnostics</span>
              {errorCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold">
                  {errorCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copié !' : 'Copier le code'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCode}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Télécharger .js
            </Button>
          </div>
        </div>

        {/* Corps principal : Code ou Diagnostics */}
        {activeTab === 'code' ? (
          <div className="flex flex-col gap-3">
            {/* Visualiseur de code avec numéros de ligne */}
            <div className="relative rounded-xl border border-[#28283C] bg-[#0F0F17] text-[#E0E0FC] font-mono text-xs overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-3.5 py-2 bg-[#171724] border-b border-[#28283C] text-[11px] text-[#A5A5BC]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="ml-2 font-semibold text-white/80">{activePage?.slug || 'page'}-logic.js</span>
                </div>
                <span className="text-[10px] text-[#7878A0]">ES6+ • Asynchrone / Await</span>
              </div>

              <div className="max-h-[380px] overflow-y-auto p-2 select-text">
                {lines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isHovered = hoveredLine === lineNum;
                  const isSelected = selectedLine === lineNum;

                  // Chercher si cette ligne correspond à un nœud
                  const mapping = compileResult.sourceMappings.find(
                    (m) => lineNum >= m.startLine && lineNum <= m.endLine
                  );

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredLine(lineNum)}
                      onMouseLeave={() => setHoveredLine(null)}
                      onClick={() => {
                        setSelectedLine(lineNum);
                        if (mapping && onSelectNode) {
                          onSelectNode(mapping.nodeId);
                        }
                      }}
                      className={`flex items-start px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#5B5BF0]/40 border-l-2 border-[#5B5BF0]'
                          : isHovered
                          ? 'bg-white/10'
                          : mapping
                          ? 'hover:bg-white/5'
                          : ''
                      }`}
                    >
                      <span className="w-8 text-right pr-3 select-none text-[#525272] text-[11px]">
                        {lineNum}
                      </span>
                      <pre className="flex-1 whitespace-pre font-mono leading-relaxed text-[#D2D2E6]">
                        {line}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panneau pédagogique "Apprendre le JavaScript sans le savoir" */}
            <div className="p-3.5 rounded-xl bg-[#EEF0FE] dark:bg-[#1C1C2C] border border-[#D8DBFA] dark:border-[#2C2C48] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#5B5BF0] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
                  💡 Apprendre le JavaScript pas à pas
                </h4>
                <p className="text-xs text-[#62627A] dark:text-[#A5A5BC] mt-0.5 leading-relaxed">
                  {activeMapping ? (
                    <span>
                      <strong className="text-[#5B5BF0] dark:text-[#7D7DF8]">
                        Bloc sélectionné :
                      </strong>{' '}
                      {activeMapping.description}. Cliquez sur une ligne de code pour illuminer directement le bloc correspondant sur votre graphe logique !
                    </span>
                  ) : (
                    <span>
                      Chaque bloc visuel que vous connectez sur votre écran génère du vrai JavaScript moderne (fonctions <code className="px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 text-[#5B5BF0]">async/await</code>, gestionnaires d&apos;événements, conditions et mutations de données).
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Onglet Diagnostics & Qualité */
          <div className="max-h-[420px] overflow-y-auto space-y-2 p-1">
            {compileResult.diagnostics.length === 0 ? (
              <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-center">
                <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Aucune erreur de compilation !
                </h4>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                  Tous les blocs et toutes les liaisons sont conformes et prêts pour la production.
                </p>
              </div>
            ) : (
              compileResult.diagnostics.map((diag) => (
                <div
                  key={diag.id}
                  onClick={() => diag.nodeId && onSelectNode && onSelectNode(diag.nodeId)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    diag.severity === 'error'
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                      : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {diag.severity === 'error' ? (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
                        {diag.title}
                      </h5>
                      <p className="text-xs text-[#62627A] dark:text-[#A5A5BC] mt-0.5">
                        {diag.message}
                      </p>
                      {diag.suggestion && (
                        <span className="text-[11px] font-semibold text-[#5B5BF0] dark:text-[#7D7DF8] block mt-1">
                          💡 Conseil : {diag.suggestion}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-[#E6E6EE] dark:border-[#28283C]">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
