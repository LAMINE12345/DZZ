'use client';

import * as React from 'react';
import { useAppStore } from '@/src/core/store';
import { Modal, Button } from '@/src/shared/ui';
import { Page } from '@/src/core/types';
import {
  Globe,
  Share2,
  FileText,
  Sparkles,
  Check,
  Search,
  Image as ImageIcon,
  Tag,
  Code2,
} from 'lucide-react';

interface SeoFormFieldsProps {
  currentPage: Page;
  projectName: string;
  onSave: (seoData: NonNullable<Page['seo']>) => void;
  onClose: () => void;
}

function SeoFormFields({ currentPage, projectName, onSave, onClose }: SeoFormFieldsProps) {
  const [title, setTitle] = React.useState(
    currentPage.seo?.title || `${currentPage.name} – ${projectName}`
  );
  const [description, setDescription] = React.useState(
    currentPage.seo?.description || `Découvrez la page ${currentPage.name} sur notre site officiel.`
  );
  const [ogImage, setOgImage] = React.useState(
    currentPage.seo?.ogImage || 'https://picsum.photos/seed/atelier-share/1200/630'
  );
  const [favicon, setFavicon] = React.useState(currentPage.seo?.favicon || '');
  const [keywords, setKeywords] = React.useState(currentPage.seo?.keywords || '');
  const [schemaType, setSchemaType] = React.useState(
    currentPage.seo?.schemaType || 'WebApplication'
  );

  const titleLength = title.length;
  const descLength = description.length;

  const handleSubmit = () => {
    onSave({
      title,
      description,
      ogImage,
      favicon,
      keywords,
      schemaType,
    });
  };

  return (
    <>
      {/* Aperçu Extrait Recherche Google */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#161622] border border-[#E6E6EE] dark:border-[#28283C] space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5B5BF0]">
          <Search className="w-3.5 h-3.5" />
          <span>Aperçu sur Google (Search Snippet)</span>
        </div>
        <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-[#12121B] border border-[#E2E8F0] dark:border-[#202032] space-y-1 select-none">
          <div className="text-[11px] text-[#202124] dark:text-[#BDC1C6] truncate flex items-center gap-1">
            <span>https://{projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.com</span>
            <span>› {currentPage.slug}</span>
          </div>
          <h3 className="text-sm font-semibold text-[#1A0DA0] dark:text-[#8AB4F8] hover:underline cursor-pointer truncate">
            {title || 'Titre de votre page web'}
          </h3>
          <p className="text-xs text-[#4D5156] dark:text-[#BDC1C6] line-clamp-2 leading-relaxed">
            {description || 'Saisissez une description claire pour votre site web.'}
          </p>
        </div>
      </div>

      {/* Champs de Saisie SEO */}
      <div className="space-y-4">
        {/* Titre SEO */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
            <label>Titre de la page (&lt;title&gt;)</label>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                titleLength >= 30 && titleLength <= 60
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
              }`}
            >
              {titleLength} / 60 caractères (Recommandé : 30-60)
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Mon Studio Design - Création Graphique à Paris"
            className="w-full px-3 py-2 text-xs bg-[#F7F7FA] dark:bg-[#181824] rounded-xl border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9]"
          />
        </div>

        {/* Meta Description */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
            <label>Meta Description</label>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                descLength >= 120 && descLength <= 160
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
              }`}
            >
              {descLength} / 160 caractères (Recommandé : 120-160)
            </span>
          </div>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Saisissez un résumé attrayant pour inviter les internautes à cliquer..."
            className="w-full px-3 py-2 text-xs bg-[#F7F7FA] dark:bg-[#181824] rounded-xl border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] resize-none"
          />
        </div>

        {/* Image de Partage OpenGraph & Favicon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
              Image de Partage (OpenGraph URL)
            </label>
            <input
              type="text"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://domaine.com/images/partage.jpg"
              className="w-full px-3 py-2 text-xs bg-[#F7F7FA] dark:bg-[#181824] rounded-xl border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
              Type de Données Structurées (Schema.org)
            </label>
            <select
              value={schemaType}
              onChange={(e) => setSchemaType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F7F7FA] dark:bg-[#181824] rounded-xl border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9]"
            >
              <option value="WebApplication">Application Web / SaaS</option>
              <option value="Website">Site Vitrine / Organisation</option>
              <option value="Product">Produit / E-commerce</option>
              <option value="Article">Article / Blog</option>
            </select>
          </div>
        </div>
      </div>

      {/* Boutons d'Action */}
      <div className="flex justify-end gap-2 pt-3 border-t border-[#E6E6EE] dark:border-[#28283C]">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSubmit} leftIcon={<Check className="w-4 h-4" />}>
          Enregistrer les modifications
        </Button>
      </div>
    </>
  );
}

export function SeoSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { project, updatePage, addToast } = useAppStore();
  const [selectedPageId, setSelectedPageId] = React.useState<string>(project.pages[0]?.id || '');

  const currentPage = project.pages.find((p) => p.id === selectedPageId) || project.pages[0];

  const handleSave = (seoData: NonNullable<Page['seo']>) => {
    if (!currentPage) return;

    updatePage(currentPage.id, {
      seo: seoData,
    });

    addToast({
      type: 'success',
      title: 'Paramètres SEO enregistrés !',
      message: `La configuration SEO de « ${currentPage.name} » a été mise à jour.`,
    });

    onClose();
  };

  if (!isOpen || !currentPage) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Paramètres SEO & Réseaux Sociaux par Page"
      size="lg"
    >
      <div className="flex flex-col gap-5 py-1">
        {/* Sélecteur de Page */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#F7F7FA] dark:bg-[#1C1C2A] border border-[#E6E6EE] dark:border-[#28283C]">
          <span className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9] shrink-0">
            Choisir la page :
          </span>
          <select
            value={selectedPageId}
            onChange={(e) => setSelectedPageId(e.target.value)}
            className="flex-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-[#12121B] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
          >
            {project.pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.isHome ? '🏠 ' : '📄 '} {p.name} (/{p.slug})
              </option>
            ))}
          </select>
        </div>

        <SeoFormFields
          key={currentPage.id}
          currentPage={currentPage}
          projectName={project.name}
          onSave={handleSave}
          onClose={onClose}
        />
      </div>
    </Modal>
  );
}
