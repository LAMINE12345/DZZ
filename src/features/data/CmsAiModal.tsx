'use client';

import * as React from 'react';
import { useAppStore } from '@/src/core/store';
import { Button } from '@/src/shared/ui';
import { Sparkles, Database, Layers, ArrowRight, Check, X, Loader2, Table } from 'lucide-react';

interface CmsAiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CmsAiModal({ isOpen, onClose }: CmsAiModalProps) {
  const { project, addToast, createCollection, addFieldToCollection, addEntryToCollection } = useAppStore();
  const [prompt, setPrompt] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [generatedCollections, setGeneratedCollections] = React.useState<any[] | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setGeneratedCollections(null);

    try {
      const res = await fetch('/app/api/cms/generate-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Échec de la génération');
      }

      setGeneratedCollections(data.collections || []);
      addToast({
        type: 'success',
        title: 'Schéma CMS généré avec succès ! ✨',
        message: `${data.collections?.length || 0} collection(s) relationnelle(s) prêtes à être intégrées.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erreur de génération',
        message: err.message || 'Impossible de générer le schéma CMS.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCollections = () => {
    if (!generatedCollections || generatedCollections.length === 0) return;

    generatedCollections.forEach((colData) => {
      // 1. Créer la collection
      const newCol = createCollection(colData.name, colData.slug, colData.description);

      // 2. Ajouter les champs
      if (colData.fields && Array.isArray(colData.fields)) {
        colData.fields.forEach((f: any) => {
          addFieldToCollection(newCol.id, {
            name: f.name,
            key: f.slug || f.key || f.name.toLowerCase().replace(/\s+/g, '_'),
            type: f.type || 'text',
            required: !!f.required,
            referenceCollectionId: f.referenceCollectionId || f.relationTargetCollectionId,
          });
        });
      }

      // 3. Injecter les données de démonstration
      if (colData.entries && Array.isArray(colData.entries)) {
        colData.entries.forEach((eData: any) => {
          addEntryToCollection(newCol.id, eData);
        });
      }
    });

    addToast({
      type: 'success',
      title: 'Collections ajoutées à votre CMS ! 🎉',
      message: `${generatedCollections.length} table(s) relationnelle(s) installée(s) avec succès.`,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Assistant IA Générateur de Schémas CMS"
    >
      <div
        className="bg-white dark:bg-[#161622] border border-[#E6E6EE] dark:border-[#28283C] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6E6EE] dark:border-[#28283C] flex items-center justify-between bg-[#FAFAFC] dark:bg-[#12121B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-[#5B5BF0] to-[#14B8A6] text-white flex items-center justify-center shadow-md font-bold">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Générateur de Schémas CMS par IA
              </h2>
              <p className="text-[11px] text-[#62627A] dark:text-[#A5A5BC]">
                Décrivez votre métier : l’IA conçoit les tables relationnelles, champs et données de démo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#8E8EA6] hover:bg-[#E6E6EE] dark:hover:bg-[#28283C] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white dark:bg-[#161622]">
          <div>
            <label className="block text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9] mb-1.5">
              Décrivez la structure ou le site que vous construisez :
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Un site d'agence immobilière avec annonces de biens, agents immobiliers, agences partenaires et demandes de visites..."
              rows={3}
              className="w-full px-4 py-3 text-xs rounded-2xl border border-[#E6E6EE] dark:border-[#28283C] bg-[#FAFAFC] dark:bg-[#12121B] text-[#1B1B2F] dark:text-[#F4F4F9] focus:outline-none focus:border-[#5B5BF0] resize-none"
            />
          </div>

          {/* Prompt Suggestions */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-[#8E8EA6]">Exemples rapides :</div>
            <div className="flex flex-wrap gap-2">
              {[
                'E-commerce de vêtements (Produits, Catégories, Commandes, Avis)',
                'Blog Médias (Articles, Auteurs, Tags, Commentaires)',
                'Événements & Billetterie (Conférences, Speakers, Billets)',
                'SaaS / Portfolio (Projets, Technologies, Clients, Témoignages)',
              ].map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(sug)}
                  className="px-3 py-1.5 text-[11px] rounded-xl bg-[#F0F0F6] dark:bg-[#1E1E2E] hover:bg-[#E6E6F0] dark:hover:bg-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] transition-all cursor-pointer text-left"
                >
                  ⚡ {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={handleGenerate}
              isLoading={loading}
              disabled={!prompt.trim()}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Générer le Schéma CMS avec Gemini 3.8
            </Button>
          </div>

          {/* Preview of Generated Collections */}
          {generatedCollections && generatedCollections.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#E6E6EE] dark:border-[#28283C] animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> {generatedCollections.length} Collection(s) prêtes
                </span>
                <span className="text-[10px] text-[#8E8EA6]">Aperçu des tables et champs</span>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {generatedCollections.map((col, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-[#E6E6EE] dark:border-[#28283C] bg-[#FAFAFC] dark:bg-[#12121B] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs text-[#1B1B2F] dark:text-[#F4F4F9]">
                        <Table className="w-4 h-4 text-[#5B5BF0]" />
                        {col.name} <span className="text-[10px] font-normal text-[#8E8EA6]">(`{col.slug}`)</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5B5BF0]/10 text-[#5B5BF0] font-semibold">
                        {col.fields?.length || 0} champs
                      </span>
                    </div>

                    <p className="text-[11px] text-[#62627A] dark:text-[#A5A5BC]">{col.description}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {col.fields?.map((f: any, fIdx: number) => (
                        <span
                          key={fIdx}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-white dark:bg-[#1E1E2E] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9]"
                        >
                          {f.name} <span className="text-[#8E8EA6]">({f.type})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleApplyCollections}
                  leftIcon={<Layers className="w-4 h-4" />}
                >
                  Installer ces {generatedCollections.length} collections dans le CMS
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
