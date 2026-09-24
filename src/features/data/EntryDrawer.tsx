'use client';

import * as React from 'react';
import { useAppStore } from '@/src/core/store';
import { Collection, CollectionField } from '@/src/core/types';
import {
  X,
  Save,
  Image as ImageIcon,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Upload,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { MediaLibraryModal } from '@/src/features/media/MediaLibraryModal';

interface EntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection;
  editingEntryId?: string | null;
}

function EntryDrawerContent({
  onClose,
  collection,
  editingEntryId,
}: EntryDrawerProps) {
  const { project, addEntryToCollection, updateEntryInCollection, addToast } = useAppStore();

  const existingEntry = React.useMemo(() => {
    if (!editingEntryId) return null;
    return collection.entries.find((e) => e.id === editingEntryId) || null;
  }, [collection.entries, editingEntryId]);

  const [formData, setFormData] = React.useState<Record<string, any>>(() => {
    if (existingEntry) {
      return { ...existingEntry };
    }
    const initial: Record<string, any> = {};
    collection.fields.forEach((f) => {
      const key = f.key || f.name.toLowerCase();
      if (f.defaultValue !== undefined) {
        initial[key] = f.defaultValue;
      } else if (f.type === 'boolean') {
        initial[key] = false;
      } else if (f.type === 'number') {
        initial[key] = 0;
      } else if (f.type === 'select' && f.options && f.options.length > 0) {
        initial[key] = f.options[0];
      } else {
        initial[key] = '';
      }
    });
    return initial;
  });
  const [isMediaModalOpen, setIsMediaModalOpen] = React.useState(false);
  const [activeImageFieldKey, setActiveImageFieldKey] = React.useState<string | null>(null);

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-générer un slug si absent et si un champ 'nom' ou 'titre' existe
    const dataToSave = { ...formData };
    if (!dataToSave.slug) {
      const nameVal = dataToSave.nom || dataToSave.titre || dataToSave.name || dataToSave.title;
      if (typeof nameVal === 'string' && nameVal.trim()) {
        dataToSave.slug = nameVal
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
    }

    if (existingEntry && editingEntryId) {
      updateEntryInCollection(collection.id, editingEntryId, dataToSave);
      addToast({
        type: 'success',
        title: 'Entrée mise à jour ! ✨',
        message: 'Les modifications sont appliquées immédiatement.',
      });
    } else {
      addEntryToCollection(collection.id, dataToSave);
    }

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-[#181824] shadow-2xl border-l border-[#E6E6EE] dark:border-[#28283C] flex flex-col animate-in slide-in-from-right duration-300">
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-[#E6E6EE] dark:border-[#28283C] flex items-center justify-between shrink-0 bg-[#FAFAFC] dark:bg-[#1E1E2D]">
          <div>
            <h2 className="text-base font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
              {existingEntry ? 'Modifier l’entrée' : 'Nouvelle entrée'}
            </h2>
            <p className="text-xs text-[#62627A] dark:text-[#A5A5BC]">
              Collection : <span className="font-semibold text-[#5B5BF0]">{collection.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#62627A] dark:text-[#A5A5BC] hover:bg-[#EAEAEA] dark:hover:bg-[#28283C] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulaire des champs */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {collection.fields.map((fld) => {
            const key = fld.key || fld.name.toLowerCase();
            const val = formData[key] ?? '';

            return (
              <div key={fld.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] flex items-center gap-1">
                    <span>{fld.name}</span>
                    {fld.required && <span className="text-red-500">*</span>}
                  </label>
                  <span className="text-[10px] text-[#82829A] font-mono">{key}</span>
                </div>

                {/* CHAMP TEXTE COURT */}
                {fld.type === 'text' && (
                  <input
                    type="text"
                    required={fld.required}
                    value={val}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    placeholder={`Saisir ${fld.name.toLowerCase()}...`}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F7FA] dark:bg-[#202030] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                  />
                )}

                {/* CHAMP TEXTE LONG */}
                {fld.type === 'long_text' && (
                  <textarea
                    rows={4}
                    required={fld.required}
                    value={val}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    placeholder={`Rédiger ${fld.name.toLowerCase()}...`}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F7FA] dark:bg-[#202030] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0] resize-none"
                  />
                )}

                {/* CHAMP NOMBRE / PRIX */}
                {fld.type === 'number' && (
                  <input
                    type="number"
                    step="any"
                    required={fld.required}
                    value={val}
                    onChange={(e) => handleFieldChange(key, e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F7FA] dark:bg-[#202030] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                  />
                )}

                {/* CHAMP IMAGE */}
                {fld.type === 'image' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        placeholder="https://... ou choisir dans la médiathèque"
                        className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#F7F7FA] dark:bg-[#202030] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveImageFieldKey(key);
                          setIsMediaModalOpen(true);
                        }}
                        className="text-xs shrink-0 flex items-center gap-1.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Médiathèque</span>
                      </Button>
                    </div>

                    {val && (
                      <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] group">
                        <img src={val} alt="Aperçu" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleFieldChange(key, '')}
                          className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* CHAMP DATE */}
                {fld.type === 'date' && (
                  <div className="relative">
                    <input
                      type="date"
                      required={fld.required}
                      value={val}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F7FA] dark:bg-[#202030] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                    />
                  </div>
                )}

                {/* CHAMP BOOLEAN (OUI/NON) */}
                {fld.type === 'boolean' && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange(key, !val)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      val
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                        : 'bg-[#F7F7FA] dark:bg-[#202030] border-[#E6E6EE] dark:border-[#28283C] text-[#82829A]'
                    }`}
                  >
                    {val ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                    <span>{val ? 'Oui (Actif)' : 'Non (Inactif)'}</span>
                  </button>
                )}

                {/* CHAMP SELECT */}
                {fld.type === 'select' && (
                  <select
                    value={val}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F7FA] dark:bg-[#202030] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                  >
                    <option value="">Sélectionner une option...</option>
                    {(fld.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {/* CHAMP REFERENCE */}
                {fld.type === 'reference' && (
                  <select
                    value={val}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F7FA] dark:bg-[#202030] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                  >
                    <option value="">Sélectionner une référence...</option>
                    {project.collections
                      ?.find((c) => c.id === fld.referenceCollectionId)
                      ?.entries.map((ent) => (
                        <option key={ent.id} value={ent.id}>
                          {ent.nom || ent.titre || ent.name || ent.id}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            );
          })}

          <div className="pt-4 border-t border-[#E6E6EE] dark:border-[#28283C] flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button size="sm" type="submit" className="flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" />
              <span>{existingEntry ? 'Enregistrer les modifications' : 'Créer l’entrée'}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Modale Médiathèque pour sélection rapide */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(media) => {
          if (activeImageFieldKey) {
            handleFieldChange(activeImageFieldKey, media.url);
          }
        }}
        title="Sélectionner une image pour l'entrée"
      />
    </>
  );
}

export function EntryDrawer(props: EntryDrawerProps) {
  if (!props.isOpen) return null;
  return <EntryDrawerContent key={`${props.collection.id}-${props.editingEntryId || 'new'}`} {...props} />;
}
