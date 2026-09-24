'use client';

import * as React from 'react';
import { useAppStore } from '@/src/core/store';
import { findElementInTree } from '@/src/core/elementTreeUtils';
import { Element, ViewportMode } from '@/src/core/types';
import {
  Sliders,
  Maximize2,
  Minimize2,
  Type,
  Palette,
  Layout,
  Move,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Smartphone,
  Tablet,
  Laptop,
  RotateCcw,
  Square,
  Circle,
  Box,
  Link,
  ExternalLink,
  Film,
  Sparkle,
  Sun,
  Shield,
  Zap,
  ArrowRight,
  Check,
  Undo,
} from 'lucide-react';
import { Input, Button, ColorPicker } from '@/src/shared/ui';
import { HEADING_FONTS, BODY_FONTS } from '@/src/core/themePresets';
import { DataBindingField } from './DataBindingField';
import { MediaLibraryModal } from '@/src/features/media/MediaLibraryModal';
import { Image as ImageIcon, Code, Sparkle as SparkleIcon } from 'lucide-react';
import { DidacticHelp, GlossaryTerm } from '@/src/features/onboarding';

// Composant d'infobulle d'aide claire et didactique
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-[#8E8EA6] hover:text-[#5B5BF0] dark:text-[#75758E] dark:hover:text-[#6B6BF7] transition-colors p-0.5 rounded-full"
        aria-label="Information d'aide"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {show && (
        <div className="absolute right-0 bottom-full mb-2 w-56 p-2.5 bg-[#1B1B2F] text-white text-[11px] leading-relaxed rounded-xl shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95">
          <div className="flex items-start gap-1.5">
            <span className="text-[#14B8A6] font-bold shrink-0">💡</span>
            <span>{text}</span>
          </div>
          <div className="absolute right-2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#1B1B2F]" />
        </div>
      )}
    </div>
  );
}

// Composant de section repliable
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

function PropSection({ title, icon, isOpen, onToggle, badge, children }: SectionProps) {
  return (
    <div className="border-b border-[#E6E6EE] dark:border-[#28283C] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-[#F7F7FA] dark:hover:bg-[#202030] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#5B5BF0] dark:text-[#6B6BF7]">{icon}</span>
          <span className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">{title}</span>
          {badge}
        </div>
        <span className="text-[#8E8EA6] dark:text-[#75758E]">
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {isOpen && <div className="p-3 pt-1 space-y-3.5 bg-white dark:bg-[#181824]">{children}</div>}
    </div>
  );
}

export function EditorPropertiesPanel() {
  const {
    project,
    activePageId,
    selectedElementId,
    selectElement,
    updateElementProps,
    updateElementStyle,
    removeElementStyleProperty,
    resetElementBreakpointStyle,
    duplicateElement,
    deleteElement,
    lockElement,
    hideElement,
    renameElement,
    viewportMode,
    addBehaviorForElement,
    experienceMode,
  } = useAppStore();

  // État d'ouverture des accordéons et modale
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    content: true,
    size: true,
    spacing: true,
    layout: true,
    colors: true,
    typography: true,
    border: false,
    shadow: false,
    effects: false,
    animation: false,
    link: false,
    advancedCode: false,
  });

  const [isMediaModalOpen, setIsMediaModalOpen] = React.useState(false);
  const [mediaTarget, setMediaTarget] = React.useState<'src' | 'backgroundImage'>('src');

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const activePage = project.pages.find((p) => p.id === activePageId) || project.pages[0];

  const matched = selectedElementId && activePage?.root
    ? findElementInTree(activePage.root, selectedElementId)
    : null;

  const element = matched?.element;

  // Si aucun élément n'est sélectionné
  if (!element) {
    return (
      <aside className="w-80 bg-white dark:bg-[#181824] border-l border-[#E6E6EE] dark:border-[#28283C] flex flex-col h-full select-none shrink-0 z-20">
        <div className="p-3.5 border-b border-[#E6E6EE] dark:border-[#28283C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#5B5BF0]" />
            <span className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
              Inspecteur de propriétés
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 text-center p-6 text-[#8E8EA6] space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#EEF0FE] dark:bg-[#202038] flex items-center justify-center text-[#5B5BF0] shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
              Sélectionnez un élément
            </h4>
            <p className="text-xs text-[#8E8EA6] dark:text-[#75758E] mt-1.5 leading-relaxed">
              Cliquez sur un composant sur la page pour modifier sa taille, ses espacements, ses couleurs de marque, sa typographie et ses animations.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#F7F7FA] dark:bg-[#202030] text-[11px] text-[#62627A] dark:text-[#A5A5BC] border border-[#E6E6EE] dark:border-[#28283C] text-left w-full space-y-1">
            <div className="font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] flex items-center gap-1.5">
              <Sparkle className="w-3 h-3 text-[#14B8A6]" /> Astuce responsive
            </div>
            <div>
              Basculez entre Ordinateur, Tablette et Mobile dans la barre du haut pour ajuster spécifiquement vos styles pour chaque écran.
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Styles spécifiques et hérités
  const desktopStyles = element.style?.desktop || {};
  const tabletStyles = element.style?.tablet || {};
  const mobileStyles = element.style?.mobile || {};

  const currentBreakpointStyle =
    viewportMode === 'mobile'
      ? mobileStyles
      : viewportMode === 'tablet'
      ? tabletStyles
      : desktopStyles;

  // Style effectif combiné
  const effectiveStyle = {
    ...desktopStyles,
    ...(viewportMode === 'tablet' || viewportMode === 'mobile' ? tabletStyles : {}),
    ...(viewportMode === 'mobile' ? mobileStyles : {}),
  };

  const isBreakpointOverridden =
    viewportMode !== 'desktop' &&
    currentBreakpointStyle &&
    Object.keys(currentBreakpointStyle).length > 0;

  const handleStyleChange = (prop: string, value: any) => {
    updateElementStyle(element.id, { [prop]: value }, viewportMode);
  };

  const handleRemoveStyleProp = (prop: string) => {
    removeElementStyleProperty(element.id, prop, viewportMode);
  };

  const handlePropChange = (prop: string, value: any) => {
    updateElementProps(element.id, { [prop]: value });
  };

  // Helper pour savoir si une propriété précise est surchargée sur l'appareil actuel
  const isPropOverridden = (propKey: string) => {
    if (viewportMode === 'desktop') return false;
    return currentBreakpointStyle[propKey] !== undefined;
  };

  // Palette de marque globale du projet (5 couleurs)
  const themeColors = [
    { name: 'Primaire', color: project.theme?.primaryColor || '#5B5BF0' },
    { name: 'Accent', color: project.theme?.accentColor || '#14B8A6' },
    { name: 'Fond', color: project.theme?.backgroundColor || '#F7F7FA' },
    { name: 'Surface', color: project.theme?.surfaceColor || '#FFFFFF' },
    { name: 'Texte', color: project.theme?.textColor || '#1B1B2F' },
  ];

  return (
    <aside className="w-80 bg-white dark:bg-[#181824] border-l border-[#E6E6EE] dark:border-[#28283C] flex flex-col h-full select-none shrink-0 z-20 overflow-y-auto">
      {/* En-tête de l'élément */}
      <div className="p-3 border-b border-[#E6E6EE] dark:border-[#28283C] bg-[#FAFAFC] dark:bg-[#1C1C2C] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#282846] dark:text-[#6B6BF7] shrink-0">
            {element.type}
          </span>
          <input
            type="text"
            value={element.customName || ''}
            placeholder={element.type}
            onChange={(e) => renameElement(element.id, e.target.value)}
            title="Cliquez pour renommer ce calque"
            className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] bg-transparent border-b border-transparent hover:border-[#5B5BF0] focus:border-[#5B5BF0] outline-none truncate max-w-[110px]"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => duplicateElement(element.id)}
            title="Dupliquer l'élément"
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#62627A] dark:text-[#A5A5BC]"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => lockElement(element.id)}
            title={element.locked ? 'Déverrouiller' : 'Verrouiller'}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#62627A] dark:text-[#A5A5BC]"
          >
            {element.locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => hideElement(element.id)}
            title={element.hidden ? 'Afficher' : 'Masquer'}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#62627A] dark:text-[#A5A5BC]"
          >
            {element.hidden ? <EyeOff className="w-3.5 h-3.5 text-red-500" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => deleteElement(element.id)}
            title="Supprimer"
            className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-950 text-[#EF4444]"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bandeau d'état Responsive et Héritage */}
      {viewportMode !== 'desktop' && (
        <div className="px-3 py-2 bg-[#F3F4FD] dark:bg-[#222238] border-b border-[#E0E2FA] dark:border-[#2C2C48] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 font-medium text-[#5B5BF0] dark:text-[#7D7DF8]">
            {viewportMode === 'mobile' ? <Smartphone className="w-3.5 h-3.5" /> : <Tablet className="w-3.5 h-3.5" />}
            <span>Mode {viewportMode === 'mobile' ? 'Mobile' : 'Tablette'}</span>
            {isBreakpointOverridden && (
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#5B5BF0] text-white font-bold">
                Personnalisé
              </span>
            )}
          </div>

          {isBreakpointOverridden ? (
            <button
              type="button"
              onClick={() => resetElementBreakpointStyle(element.id, viewportMode)}
              className="text-[10px] text-[#62627A] hover:text-[#EF4444] dark:text-[#A5A5BC] flex items-center gap-1 font-semibold"
              title="Réinitialise tous les styles personnalisés pour cet écran pour hériter du bureau"
            >
              <RotateCcw className="w-3 h-3" />
              Réinitialiser
            </button>
          ) : (
            <span className="text-[10px] text-[#8E8EA6] dark:text-[#75758E] italic">
              Hérité du grand écran
            </span>
          )}
        </div>
      )}

      {/* Bouton d'action Comportement Logique */}
      <div className="p-3 bg-[#EEF0FE] dark:bg-[#1E1E34] border-b border-[#D8DBFA] dark:border-[#2C2C48] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#5B5BF0] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9] block truncate">
              Comportement Logique
            </span>
            <span className="text-[10px] text-[#62627A] dark:text-[#A5A5BC] block truncate">
              Rendre interactif au clic
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => addBehaviorForElement(element.id)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Créer
        </Button>
      </div>

      {/* Accordéons de propriétés */}
      <div className="divide-y divide-[#E6E6EE] dark:divide-[#28283C]">
        {/* ================= 1. CONTENU CONTEXTUEL DU TYPE ================= */}
        <PropSection
          title="Contenu & Balise"
          icon={<Type className="w-3.5 h-3.5" />}
          isOpen={openSections.content}
          onToggle={() => toggleSection('content')}
        >
          {/* Mode de placement & Balise sémantique pour les boîtes / sections */}
          {(element.type === 'section' || element.type === 'box' || element.type === 'columns') && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA6] dark:text-[#75758E]">
                    Mode de placement
                  </label>
                  <DidacticHelp
                    title="Mode de placement"
                    explanation="Le mode Automatique organise vos blocs de façon alignée et propre (parfait pour le responsive). Le mode Libre permet de placer des blocs au pixel près."
                    concreteExample="Utilisez Automatique pour que le texte reste lisible sur mobile sans déborder."
                    animationType="card"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F7F7FA] dark:bg-[#202030] border border-[#E6E6EE] dark:border-[#28283C]">
                  <button
                    type="button"
                    onClick={() => handlePropChange('layoutMode', 'auto')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      element.props?.layoutMode !== 'free'
                        ? 'bg-white dark:bg-[#181824] text-[#5B5BF0] dark:text-[#6B6BF7] shadow-xs'
                        : 'text-[#62627A] dark:text-[#8E8EA6]'
                    }`}
                  >
                    Automatique
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePropChange('layoutMode', 'free')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      element.props?.layoutMode === 'free'
                        ? 'bg-white dark:bg-[#181824] text-[#5B5BF0] dark:text-[#6B6BF7] shadow-xs'
                        : 'text-[#62627A] dark:text-[#8E8EA6]'
                    }`}
                  >
                    Libre (Absolu)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Balise HTML Sémantique
                  </label>
                  <InfoTooltip text="Définit la balise HTML générée pour optimiser le référencement SEO et l'accessibilité." />
                </div>
                <select
                  value={element.props?.tag || (element.type === 'section' ? 'section' : 'div')}
                  onChange={(e) => handlePropChange('tag', e.target.value)}
                  className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
                >
                  <option value="section">&lt;section&gt; — Section thématique</option>
                  <option value="header">&lt;header&gt; — En-tête de page ou bloc</option>
                  <option value="footer">&lt;footer&gt; — Pied de page</option>
                  <option value="nav">&lt;nav&gt; — Barre de navigation</option>
                  <option value="main">&lt;main&gt; — Contenu principal unique</option>
                  <option value="article">&lt;article&gt; — Fiche ou article autonome</option>
                  <option value="aside">&lt;aside&gt; — Barre latérale / complément</option>
                  <option value="div">&lt;div&gt; — Conteneur générique</option>
                  <option value="figure">&lt;figure&gt; — Illustration ou média</option>
                </select>
              </div>
            </div>
          )}

          {/* Balise HTML Personnalisée / Code Brut */}
          {element.type === 'custom_html' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Code HTML brut
                  </label>
                  <InfoTooltip text="Insérez n'importe quelle balise HTML (<canvas>, <svg>, <details>, <marquee>, etc.)." />
                </div>
                <textarea
                  rows={8}
                  value={element.props?.htmlCode || ''}
                  onChange={(e) => handlePropChange('htmlCode', e.target.value)}
                  placeholder="<div class='custom'>\n  <p>Mon HTML</p>\n</div>"
                  className="w-full bg-[#1E1E2E] text-[#F4F4F9] font-mono border border-[#E6E6EE] dark:border-[#28283C] rounded-xl p-2.5 text-xs outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Lien Hypertexte <a> */}
          {element.type === 'link' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Texte du lien
                  </label>
                </div>
                <input
                  type="text"
                  value={element.props?.text || ''}
                  onChange={(e) => handlePropChange('text', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Cible (href)
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="https://... ou #section"
                  value={element.props?.href || ''}
                  onChange={(e) => handlePropChange('href', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Fenêtre d’ouverture (target)
                </label>
                <select
                  value={element.props?.target || '_self'}
                  onChange={(e) => handlePropChange('target', e.target.value)}
                  className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
                >
                  <option value="_self">Même onglet (_self)</option>
                  <option value="_blank">Nouvel onglet (_blank)</option>
                </select>
              </div>
            </div>
          )}

          {/* Séparateur <hr> */}
          {element.type === 'divider' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Style de ligne
                </label>
                <select
                  value={element.props?.lineStyle || 'solid'}
                  onChange={(e) => handlePropChange('lineStyle', e.target.value)}
                  className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
                >
                  <option value="solid">Ligne continue (Solid)</option>
                  <option value="dashed">Tirets (Dashed)</option>
                  <option value="dotted">Pointillés (Dotted)</option>
                </select>
              </div>
            </div>
          )}

          {/* Citation <blockquote> */}
          {element.type === 'blockquote' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Texte de la citation
                </label>
                <textarea
                  rows={3}
                  value={element.props?.quote || ''}
                  onChange={(e) => handlePropChange('quote', e.target.value)}
                  className="w-full bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl p-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Auteur / Source (&lt;cite&gt;)
                </label>
                <input
                  type="text"
                  value={element.props?.author || ''}
                  onChange={(e) => handlePropChange('author', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Bloc de code <pre><code> */}
          {element.type === 'code_block' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Langage
                </label>
                <select
                  value={element.props?.language || 'javascript'}
                  onChange={(e) => handlePropChange('language', e.target.value)}
                  className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
                >
                  <option value="html">HTML</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                  <option value="python">Python</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Code source
                </label>
                <textarea
                  rows={6}
                  value={element.props?.code || ''}
                  onChange={(e) => handlePropChange('code', e.target.value)}
                  className="w-full bg-[#1E1E2E] text-[#F4F4F9] font-mono border border-[#E6E6EE] dark:border-[#28283C] rounded-xl p-2.5 text-xs outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Tableau HTML <table> */}
          {element.type === 'table' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  En-têtes (&lt;th&gt;, séparés par virgules)
                </label>
                <input
                  type="text"
                  value={(element.props?.headers || []).join(', ')}
                  onChange={(e) =>
                    handlePropChange(
                      'headers',
                      e.target.value.split(',').map((s) => s.trim())
                    )
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Accordéon <details><summary> */}
          {element.type === 'accordion' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Titre du résumé (&lt;summary&gt;)
                </label>
                <input
                  type="text"
                  value={element.props?.summary || ''}
                  onChange={(e) => handlePropChange('summary', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Contenu détaillé
                </label>
                <textarea
                  rows={3}
                  value={element.props?.content || ''}
                  onChange={(e) => handlePropChange('content', e.target.value)}
                  className="w-full bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl p-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Audio <audio> */}
          {element.type === 'audio' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  URL du fichier audio (.mp3, .wav)
                </label>
                <input
                  type="text"
                  value={element.props?.audioUrl || ''}
                  onChange={(e) => handlePropChange('audioUrl', e.target.value)}
                  placeholder="https://.../audio.mp3"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Iframe <iframe> */}
          {element.type === 'iframe' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  URL d'intégration (src)
                </label>
                <input
                  type="text"
                  value={element.props?.src || ''}
                  onChange={(e) => handlePropChange('src', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Titre du cadre (title)
                </label>
                <input
                  type="text"
                  value={element.props?.title || ''}
                  onChange={(e) => handlePropChange('title', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Titre */}
          {element.type === 'heading' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Texte du titre
                  </label>
                  <DidacticHelp
                    title="Texte du titre"
                    explanation="Le titre principal capte l’attention du visiteur dès la première seconde."
                    concreteExample="« Des créations sur-mesure pour sublimer votre intérieur »"
                    animationType="pulse"
                  />
                </div>
                <input
                  type="text"
                  value={element.props?.text || ''}
                  onChange={(e) => handlePropChange('text', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
                <DataBindingField
                  element={element}
                  propKey="text"
                  label="Titre dynamique"
                  allowedTypes={['text', 'number']}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Niveau sémantique (Balise HTML)
                  </label>
                  <InfoTooltip text="H1 pour le titre principal, H2 pour les sections, H3 pour les sous-parties." />
                </div>
                <select
                  value={element.props?.tag || 'h2'}
                  onChange={(e) => handlePropChange('tag', e.target.value)}
                  className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
                >
                  <option value="h1">H1 — Titre principal de la page</option>
                  <option value="h2">H2 — Titre de section majeure</option>
                  <option value="h3">H3 — Sous-section / Carte</option>
                  <option value="h4">H4 — Petit titre d’encadré</option>
                </select>
              </div>
            </div>
          )}

          {/* Paragraphe / Texte */}
          {element.type === 'text' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                  Contenu du texte
                </label>
                <InfoTooltip text="Vous pouvez écrire plusieurs lignes. Les sauts de ligne sont respectés." />
              </div>
              <textarea
                rows={4}
                value={element.props?.text || ''}
                onChange={(e) => handlePropChange('text', e.target.value)}
                className="w-full bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl p-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
              />
              <DataBindingField
                element={element}
                propKey="text"
                label="Texte dynamique"
                allowedTypes={['text', 'long_text', 'number']}
              />
            </div>
          )}

          {/* Bouton */}
          {element.type === 'button' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Libellé du bouton
                  </label>
                  <InfoTooltip text="Le texte affiché sur le bouton d'appel à l'action." />
                </div>
                <input
                  type="text"
                  value={element.props?.label || ''}
                  onChange={(e) => handlePropChange('label', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
                <DataBindingField
                  element={element}
                  propKey="label"
                  label="Libellé dynamique"
                  allowedTypes={['text', 'number']}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Lien de redirection (URL ou Ancre)
                  </label>
                  <InfoTooltip text="Ex: https://monsite.com, #contact ou une page de votre projet." />
                </div>
                <input
                  type="text"
                  placeholder="https://... ou #section"
                  value={element.props?.linkUrl || ''}
                  onChange={(e) => handlePropChange('linkUrl', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Image */}
          {element.type === 'image' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Adresse URL de l’image
                  </label>
                  <InfoTooltip text="Lien direct vers votre image (JPEG, PNG, WebP, SVG)." />
                </div>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={element.props?.src || ''}
                    onChange={(e) => handlePropChange('src', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMediaTarget('src');
                      setIsMediaModalOpen(true);
                    }}
                    className="w-full text-xs flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#5B5BF0]" />
                    <span>Choisir dans la Médiathèque</span>
                  </Button>
                </div>
                <DataBindingField
                  element={element}
                  propKey="src"
                  label="Image dynamique"
                  allowedTypes={['image', 'text']}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Texte alternatif (Accessibilité & SEO)
                  </label>
                  <InfoTooltip text="Description de l'image pour les malvoyants et les moteurs de recherche." />
                </div>
                <input
                  type="text"
                  placeholder="Ex: Paysage montagnard au coucher du soleil"
                  value={element.props?.alt || ''}
                  onChange={(e) => handlePropChange('alt', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Vidéo */}
          {element.type === 'video' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                  Lien vidéo (YouTube / MP4)
                </label>
                <InfoTooltip text="Collez l'URL d'intégration YouTube ou le lien direct du fichier .mp4." />
              </div>
              <input
                type="text"
                value={element.props?.url || ''}
                onChange={(e) => handlePropChange('url', e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
              />
            </div>
          )}

          {/* Formulaire / Input */}
          {element.type === 'input' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Libellé (Étiquette au-dessus)
                  </label>
                  <InfoTooltip text="Nom du champ affiché pour guider l'utilisateur." />
                </div>
                <input
                  type="text"
                  value={element.props?.label || ''}
                  onChange={(e) => handlePropChange('label', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Texte d’indication (Placeholder)
                  </label>
                  <InfoTooltip text="Texte grisé qui disparaît dès que le visiteur tape au clavier." />
                </div>
                <input
                  type="text"
                  value={element.props?.placeholder || ''}
                  onChange={(e) => handlePropChange('placeholder', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Case à cocher */}
          {element.type === 'checkbox' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                  Texte de la case
                </label>
                <InfoTooltip text="Texte explicatif à côté de la case à cocher." />
              </div>
              <input
                type="text"
                value={element.props?.label || ''}
                onChange={(e) => handlePropChange('label', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
              />
            </div>
          )}

          {/* Barre de navigation <nav> */}
          {element.type === 'navbar' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Nom de la marque / Logo texte
                </label>
                <input
                  type="text"
                  value={element.props?.brandText || ''}
                  onChange={(e) => handlePropChange('brandText', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  URL du logo image (facultatif)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={element.props?.brandLogoUrl || ''}
                  onChange={(e) => handlePropChange('brandLogoUrl', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Bouton CTA (Libellé)
                </label>
                <input
                  type="text"
                  value={element.props?.ctaLabel || ''}
                  onChange={(e) => handlePropChange('ctaLabel', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Bouton CTA (Lien href)
                </label>
                <input
                  type="text"
                  value={element.props?.ctaHref || ''}
                  onChange={(e) => handlePropChange('ctaHref', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Zone de texte <textarea> */}
          {element.type === 'textarea' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Libellé du champ
                </label>
                <input
                  type="text"
                  value={element.props?.label || ''}
                  onChange={(e) => handlePropChange('label', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Texte d’indication (Placeholder)
                </label>
                <input
                  type="text"
                  value={element.props?.placeholder || ''}
                  onChange={(e) => handlePropChange('placeholder', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Nombre de lignes (hauteur)
                </label>
                <input
                  type="number"
                  min={2}
                  max={12}
                  value={element.props?.rows || 4}
                  onChange={(e) => handlePropChange('rows', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Menu déroulant <select> */}
          {element.type === 'select' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Libellé
                </label>
                <input
                  type="text"
                  value={element.props?.label || ''}
                  onChange={(e) => handlePropChange('label', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Options (séparées par des virgules)
                </label>
                <input
                  type="text"
                  value={(element.props?.options || []).join(', ')}
                  onChange={(e) =>
                    handlePropChange(
                      'options',
                      e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Boutons radio <radio> */}
          {element.type === 'radio' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Libellé du groupe
                </label>
                <input
                  type="text"
                  value={element.props?.label || ''}
                  onChange={(e) => handlePropChange('label', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Choix possibles (séparés par virgules)
                </label>
                <input
                  type="text"
                  value={(element.props?.options || []).join(', ')}
                  onChange={(e) =>
                    handlePropChange(
                      'options',
                      e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Interrupteur switch */}
          {element.type === 'switch' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Libellé de l'interrupteur
                </label>
                <input
                  type="text"
                  value={element.props?.label || ''}
                  onChange={(e) => handlePropChange('label', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#62627A] dark:text-[#A5A5BC]">État par défaut</span>
                <input
                  type="checkbox"
                  checked={element.props?.checked ?? true}
                  onChange={(e) => handlePropChange('checked', e.target.checked)}
                  className="w-4 h-4 text-[#5B5BF0] rounded"
                />
              </div>
            </div>
          )}

          {/* Curseur range */}
          {element.type === 'range' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Libellé
                </label>
                <input
                  type="text"
                  value={element.props?.label || ''}
                  onChange={(e) => handlePropChange('label', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-[#8E8EA6] block">Min</label>
                  <input
                    type="number"
                    value={element.props?.min ?? 0}
                    onChange={(e) => handlePropChange('min', Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-[#E6E6EE] dark:border-[#28283C]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8E8EA6] block">Max</label>
                  <input
                    type="number"
                    value={element.props?.max ?? 100}
                    onChange={(e) => handlePropChange('max', Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-[#E6E6EE] dark:border-[#28283C]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8E8EA6] block">Unité</label>
                  <input
                    type="text"
                    value={element.props?.unit || ''}
                    placeholder="€, %, px"
                    onChange={(e) => handlePropChange('unit', e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-[#E6E6EE] dark:border-[#28283C]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Barre de progression progress_bar */}
          {element.type === 'progress_bar' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Libellé
                </label>
                <input
                  type="text"
                  value={element.props?.label || ''}
                  onChange={(e) => handlePropChange('label', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#8E8EA6] block">Valeur ({element.props?.value ?? 60}%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={element.props?.value ?? 60}
                    onChange={(e) => handlePropChange('value', Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-[#E6E6EE] dark:border-[#28283C]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8E8EA6] block">Couleur</label>
                  <input
                    type="color"
                    value={element.props?.color || '#5B5BF0'}
                    onChange={(e) => handlePropChange('color', e.target.value)}
                    className="w-full h-7 rounded-lg border border-[#E6E6EE] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Vidéo YouTube / Vimeo Embed */}
          {element.type === 'video_embed' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  URL de la vidéo (YouTube / Vimeo)
                </label>
                <input
                  type="text"
                  value={element.props?.videoUrl || ''}
                  onChange={(e) => handlePropChange('videoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Étoiles de notation rating */}
          {element.type === 'rating' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#8E8EA6] block">Note (sur 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    max={5}
                    value={element.props?.score ?? 5}
                    onChange={(e) => handlePropChange('score', Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-[#E6E6EE] dark:border-[#28283C]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8E8EA6] block">Texte des avis</label>
                  <input
                    type="text"
                    value={element.props?.reviewCount || ''}
                    placeholder="128 avis"
                    onChange={(e) => handlePropChange('reviewCount', e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-[#E6E6EE] dark:border-[#28283C]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* KPI Stat */}
          {element.type === 'stat_kpi' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Valeur Clé (Grand Chiffre)
                </label>
                <input
                  type="text"
                  value={element.props?.value || ''}
                  placeholder="99.9%"
                  onChange={(e) => handlePropChange('value', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Libellé
                </label>
                <input
                  type="text"
                  value={element.props?.label || ''}
                  placeholder="Satisfaction client"
                  onChange={(e) => handlePropChange('label', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Tendance
                </label>
                <input
                  type="text"
                  value={element.props?.trend || ''}
                  placeholder="+14% ce mois"
                  onChange={(e) => handlePropChange('trend', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Alerte alert */}
          {element.type === 'alert' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Type d'alerte
                </label>
                <select
                  value={element.props?.variant || 'info'}
                  onChange={(e) => handlePropChange('variant', e.target.value)}
                  className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs"
                >
                  <option value="info">Information (Bleu)</option>
                  <option value="success">Succès (Vert)</option>
                  <option value="warning">Avertissement (Orange)</option>
                  <option value="error">Erreur (Rouge)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={element.props?.title || ''}
                  onChange={(e) => handlePropChange('title', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Message
                </label>
                <textarea
                  rows={2}
                  value={element.props?.message || ''}
                  onChange={(e) => handlePropChange('message', e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
              </div>
            </div>
          )}

          {/* Balise / Badge / Tag */}
          {element.type === 'badge' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Texte de la balise
                  </label>
                  <InfoTooltip text="Libellé affiché sur la balise / badge." />
                </div>
                <input
                  type="text"
                  value={element.props?.text || ''}
                  onChange={(e) => handlePropChange('text', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
                />
                <DataBindingField
                  element={element}
                  propKey="text"
                  label="Texte dynamique"
                  allowedTypes={['text', 'number']}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Icône de la balise
                  </label>
                  <InfoTooltip text="Icône décorative facultative affichée avec la balise." />
                </div>
                <select
                  value={element.props?.iconName || 'none'}
                  onChange={(e) => handlePropChange('iconName', e.target.value === 'none' ? undefined : e.target.value)}
                  className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
                >
                  <option value="none">Aucune icône</option>
                  <option value="Tag">Tag / Étiquette</option>
                  <option value="Sparkles">Étincelles / Nouveauté</option>
                  <option value="Star">Étoile / Favori</option>
                  <option value="Zap">Éclair / Tendance</option>
                  <option value="Heart">Cœur / Coup de cœur</option>
                  <option value="Check">Coche / Validé</option>
                </select>
              </div>
            </div>
          )}
        </PropSection>

        {/* ================= 2. TAILLE, DIMENSIONS & POSITION LIBRE ================= */}
        <PropSection
          title="Dimensions & Position Libre"
          icon={<Maximize2 className="w-3.5 h-3.5" />}
          isOpen={openSections.size}
          onToggle={() => toggleSection('size')}
          badge={
            effectiveStyle.position === 'absolute' ? (
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#10B981] text-white rounded-full">
                Libre
              </span>
            ) : isPropOverridden('width') || isPropOverridden('maxWidth') || isPropOverridden('minHeight') ? (
              <span className="w-2 h-2 rounded-full bg-[#5B5BF0]" />
            ) : null
          }
        >
          {/* Mode de Positionnement : Flux continu vs Position Libre (Style Canva) */}
          <div className="p-2.5 bg-[#F7F7FA] dark:bg-[#202030] rounded-xl border border-[#E6E6EE] dark:border-[#28283C]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9] flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-[#5B5BF0]" />
                Mode de placement
              </span>
              <InfoTooltip text="Flux Normal : aligné et réordonnable automatiquement. Libre (Canva) : déplaçable au pixel près avec la souris n'importe où sur l'écran." />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  handleStyleChange('position', undefined);
                  handleStyleChange('left', undefined);
                  handleStyleChange('top', undefined);
                  handleStyleChange('zIndex', undefined);
                }}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                  effectiveStyle.position !== 'absolute'
                    ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7] shadow-xs'
                    : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                }`}
              >
                Flux Normal
              </button>
              <button
                type="button"
                onClick={() => {
                  handleStyleChange('position', 'absolute');
                  if (effectiveStyle.left === undefined) handleStyleChange('left', '30px');
                  if (effectiveStyle.top === undefined) handleStyleChange('top', '30px');
                  if (effectiveStyle.zIndex === undefined) handleStyleChange('zIndex', 10);
                }}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                  effectiveStyle.position === 'absolute'
                    ? 'border-[#10B981] bg-[#ECFDF5] text-[#059669] dark:bg-[#064E3B]/40 dark:text-[#34D399] shadow-xs'
                    : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                }`}
              >
                <span>✦ Libre (Canva)</span>
              </button>
            </div>

            {/* Coordonnées en mode libre */}
            {effectiveStyle.position === 'absolute' && (
              <div className="mt-3 pt-2.5 border-t border-[#E6E6EE] dark:border-[#2C2C40] space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC] mb-1 block">
                      Position X (Gauche)
                    </label>
                    <input
                      type="text"
                      placeholder="ex: 40px"
                      value={effectiveStyle.left !== undefined ? effectiveStyle.left : ''}
                      onChange={(e) => handleStyleChange('left', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC] mb-1 block">
                      Position Y (Haut)
                    </label>
                    <input
                      type="text"
                      placeholder="ex: 40px"
                      value={effectiveStyle.top !== undefined ? effectiveStyle.top : ''}
                      onChange={(e) => handleStyleChange('top', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-1">
                      Superposition (Z-Index)
                    </label>
                    <input
                      type="number"
                      value={effectiveStyle.zIndex || 10}
                      onChange={(e) => handleStyleChange('zIndex', Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                    />
                  </div>

                  <div className="flex items-end gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleStyleChange('left', '0px');
                        handleStyleChange('top', '0px');
                      }}
                      title="En haut à gauche (0, 0)"
                      className="px-2 py-1 text-[11px] rounded-lg border border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] hover:bg-[#F7F7FA] font-medium text-[#62627A] dark:text-[#A5A5BC]"
                    >
                      (0, 0)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleStyleChange('left', '50%');
                        handleStyleChange('transform', 'translateX(-50%)');
                      }}
                      title="Centrer horizontalement"
                      className="px-2 py-1 text-[11px] rounded-lg border border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] hover:bg-[#F7F7FA] font-medium text-[#62627A] dark:text-[#A5A5BC]"
                    >
                      Centrer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Largeur */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Largeur (Width)
              </label>
              <InfoTooltip text="Taille horizontale : 'auto' s'adapte au contenu, '100%' remplit toute la largeur, ou dimension en px." />
            </div>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {[
                { label: 'Auto', val: 'auto' },
                { label: 'Pleine (100%)', val: '100%' },
                { label: 'Fixe (360px)', val: '360px' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => handleStyleChange('width', btn.val)}
                  className={`py-1 text-[11px] font-medium rounded-lg border transition-all ${
                    effectiveStyle.width === btn.val
                      ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7]'
                      : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Valeur personnalisée (ex: 320px, 80%)"
              value={effectiveStyle.width || ''}
              onChange={(e) => handleStyleChange('width', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
            />
          </div>

          {/* Hauteur */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Hauteur (Height)
              </label>
              <InfoTooltip text="Taille verticale en pixels ou 'auto' pour s'adapter naturellement au contenu." />
            </div>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {[
                { label: 'Auto', val: 'auto' },
                { label: '200px', val: '200px' },
                { label: '400px', val: '400px' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => handleStyleChange('height', btn.val)}
                  className={`py-1 text-[11px] font-medium rounded-lg border transition-all ${
                    effectiveStyle.height === btn.val
                      ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7]'
                      : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="ex: auto, 240px, 100%"
              value={effectiveStyle.height || ''}
              onChange={(e) => handleStyleChange('height', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
            />
          </div>

          {/* Largeur maximale (Max Width) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Largeur maximale (Max)
              </label>
              <InfoTooltip text="Empêche le bloc de devenir trop large sur les très grands écrans." />
            </div>
            <select
              value={effectiveStyle.maxWidth || 'none'}
              onChange={(e) => handleStyleChange('maxWidth', e.target.value === 'none' ? undefined : e.target.value)}
              className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
            >
              <option value="none">Aucune limite (Plein écran)</option>
              <option value="640px">640px (Étroit / Formulaire)</option>
              <option value="768px">768px (Article lisible)</option>
              <option value="1024px">1024px (Standard Web)</option>
              <option value="1200px">1200px (Large conteneur)</option>
              <option value="1400px">1400px (Très grand écran)</option>
            </select>
          </div>

          {/* Hauteur minimale */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Hauteur minimale
              </label>
              <InfoTooltip text="Garantit une hauteur minimum même si le contenu est court." />
            </div>
            <input
              type="text"
              placeholder="ex: auto, 120px, 100vh"
              value={effectiveStyle.minHeight || ''}
              onChange={(e) => handleStyleChange('minHeight', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
            />
          </div>

          {/* Indication didactique poignées sur Canva */}
          <div className="p-2.5 bg-[#EEF0FE] dark:bg-[#202038] rounded-xl text-[11px] text-[#5B5BF0] dark:text-[#7D7DF8] leading-relaxed flex items-start gap-2">
            <span className="shrink-0 text-sm">✨</span>
            <span>
              <strong>Astuce directe :</strong> Sélectionnez n’importe quelle balise sur le canva pour afficher ses <strong>8 poignées de redimensionnement</strong> bleues et son icône de <strong>déplacement libre</strong>.
            </span>
          </div>
        </PropSection>

        {/* ================= 3. ESPACEMENT (PADDING & MARGIN) ================= */}
        <PropSection
          title="Espacement & Marges"
          icon={<Move className="w-3.5 h-3.5" />}
          isOpen={openSections.spacing}
          onToggle={() => toggleSection('spacing')}
          badge={
            isPropOverridden('padding') || isPropOverridden('margin') || isPropOverridden('gap') ? (
              <span className="w-2 h-2 rounded-full bg-[#5B5BF0]" />
            ) : null
          }
        >
          {/* Marge intérieure (Padding) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Marge intérieure (Padding)
              </label>
              <InfoTooltip text="Marge intérieure : l'espace d'aération entre le bord du bloc et son contenu." />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '0px', val: '0px' },
                { label: '12px', val: '12px' },
                { label: '24px', val: '24px' },
                { label: '48px', val: '48px 24px' },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleStyleChange('padding', p.val)}
                  className={`py-1 text-[11px] font-medium rounded-lg border transition-all ${
                    effectiveStyle.padding === p.val
                      ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7]'
                      : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Ex: 24px ou 32px 16px"
              value={effectiveStyle.padding || ''}
              onChange={(e) => handleStyleChange('padding', e.target.value)}
              className="mt-1.5 w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
            />
          </div>

          {/* Marge externe (Margin) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Marge externe (Margin)
              </label>
              <InfoTooltip text="Marge externe : l'espace extérieur qui repousse les autres blocs voisins." />
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-1.5">
              {[
                { label: '0', val: '0' },
                { label: 'Centré auto', val: '0 auto' },
                { label: 'Aéré (24px)', val: '24px 0' },
              ].map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => handleStyleChange('margin', m.val)}
                  className={`py-1 text-[11px] font-medium rounded-lg border transition-all ${
                    effectiveStyle.margin === m.val
                      ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7]'
                      : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Ex: 16px ou 0 auto"
              value={effectiveStyle.margin || ''}
              onChange={(e) => handleStyleChange('margin', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
            />
          </div>

          {/* Espacement interne entre éléments (Gap) */}
          {(element.type === 'box' || element.type === 'section' || element.type === 'columns') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                  Espacement entre éléments (Gap)
                </label>
                <InfoTooltip text="L'espace automatique entre chaque sous-élément contenu dans ce bloc." />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="64"
                  step="4"
                  value={parseInt(effectiveStyle.gap || element.props?.gap || '16', 10) || 0}
                  onChange={(e) => {
                    const val = `${e.target.value}px`;
                    handleStyleChange('gap', val);
                    handlePropChange('gap', parseInt(e.target.value, 10));
                  }}
                  className="flex-1 accent-[#5B5BF0]"
                />
                <span className="text-xs font-mono font-bold text-[#5B5BF0] w-12 text-right">
                  {effectiveStyle.gap || `${element.props?.gap || 16}px`}
                </span>
              </div>
            </div>
          )}
        </PropSection>

        {/* ================= 4. DISPOSITION, FLEXBOX & CSS GRID ================= */}
        <PropSection
          title="Disposition (Display, Flexbox & Grid)"
          icon={<Layout className="w-3.5 h-3.5" />}
          isOpen={openSections.layout}
          onToggle={() => toggleSection('layout')}
          badge={
            isPropOverridden('display') ||
            isPropOverridden('flexDirection') ||
            isPropOverridden('gridTemplateColumns') ||
            isPropOverridden('justifyContent') ||
            isPropOverridden('alignItems') ? (
              <span className="w-2 h-2 rounded-full bg-[#5B5BF0]" />
            ) : null
          }
        >
          {/* Mode de Display CSS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Mode d'affichage (Display)
              </label>
              <InfoTooltip text="Block : bloc standard. Flex : mise en page flexible. Grid : grille CSS 2D. Inline-block : en ligne avec dimensions." />
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#F7F7FA] dark:bg-[#202030] border border-[#E6E6EE] dark:border-[#28283C]">
              {[
                { label: 'Bloc (Block)', val: 'block' },
                { label: 'Flexbox ⚡', val: 'flex' },
                { label: 'Grille (Grid) 📐', val: 'grid' },
                { label: 'Inline-Block', val: 'inline-block' },
                { label: 'Inline-Flex', val: 'inline-flex' },
                { label: 'Masqué (None)', val: 'none' },
              ].map((d) => {
                const currentDisplay = effectiveStyle.display || (element.type === 'box' || element.type === 'section' || element.type === 'columns' ? 'flex' : 'block');
                const isCurrent = currentDisplay === d.val;
                return (
                  <button
                    key={d.val}
                    type="button"
                    onClick={() => {
                      handleStyleChange('display', d.val);
                      if (d.val === 'flex' && !effectiveStyle.flexDirection) {
                        handleStyleChange('flexDirection', 'column');
                      }
                      if (d.val === 'grid' && !effectiveStyle.gridTemplateColumns) {
                        handleStyleChange('gridTemplateColumns', 'repeat(2, 1fr)');
                      }
                    }}
                    className={`py-1.5 px-1 text-[10px] font-semibold rounded-lg transition-all text-center truncate ${
                      isCurrent
                        ? 'bg-[#5B5BF0] text-white shadow-xs font-bold'
                        : 'text-[#62627A] dark:text-[#8E8EA6] hover:bg-white/50 dark:hover:bg-[#181824]'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= SOUS-SECTION FLEXBOX ================= */}
          {((effectiveStyle.display || (['box', 'section', 'columns'].includes(element.type) ? 'flex' : 'block')) === 'flex' ||
            effectiveStyle.display === 'inline-flex') && (
            <div className="space-y-3 pt-2 border-t border-[#E6E6EE] dark:border-[#28283C] animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B5BF0] flex items-center gap-1">
                  ⚡ Options Flexbox
                </span>
              </div>

              {/* Flex Direction */}
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Direction du flux (flex-direction)
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { label: '↓ Colonne (Vertical)', val: 'column' },
                    { label: '→ Ligne (Horizontal)', val: 'row' },
                    { label: '↑ Colonne Inversée', val: 'column-reverse' },
                    { label: '← Ligne Inversée', val: 'row-reverse' },
                  ].map((dir) => (
                    <button
                      key={dir.val}
                      type="button"
                      onClick={() => handleStyleChange('flexDirection', dir.val)}
                      className={`py-1 px-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                        (effectiveStyle.flexDirection || 'column') === dir.val
                          ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7] font-semibold'
                          : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                      }`}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flex Wrap (Retour à la ligne) */}
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Retour à la ligne (flex-wrap)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: 'Ligne unique', val: 'nowrap' },
                    { label: 'Retour auto (Wrap)', val: 'wrap' },
                    { label: 'Wrap Inversé', val: 'wrap-reverse' },
                  ].map((w) => (
                    <button
                      key={w.val}
                      type="button"
                      onClick={() => handleStyleChange('flexWrap', w.val)}
                      className={`py-1 text-[10px] font-medium rounded-lg border transition-all ${
                        (effectiveStyle.flexWrap || 'nowrap') === w.val
                          ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7] font-semibold'
                          : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Justify Content */}
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Alignement principal (justify-content)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: 'Début', val: 'flex-start' },
                    { label: 'Centre', val: 'center' },
                    { label: 'Fin', val: 'flex-end' },
                    { label: 'Espaces Extrêmes', val: 'space-between' },
                    { label: 'Espaces Autour', val: 'space-around' },
                    { label: 'Espaces Égaux', val: 'space-evenly' },
                  ].map((j) => (
                    <button
                      key={j.val}
                      type="button"
                      onClick={() => handleStyleChange('justifyContent', j.val)}
                      className={`py-1 text-[10px] font-medium rounded-lg border transition-all ${
                        effectiveStyle.justifyContent === j.val
                          ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7] font-semibold'
                          : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                      }`}
                    >
                      {j.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Align Items */}
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Alignement transversal (align-items)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: 'Début (Haut)', val: 'flex-start' },
                    { label: 'Centre', val: 'center' },
                    { label: 'Fin (Bas)', val: 'flex-end' },
                    { label: 'Étirer (Stretch)', val: 'stretch' },
                    { label: 'Ligne de base', val: 'baseline' },
                  ].map((a) => (
                    <button
                      key={a.val}
                      type="button"
                      onClick={() => handleStyleChange('alignItems', a.val)}
                      className={`py-1 text-[10px] font-medium rounded-lg border transition-all ${
                        effectiveStyle.alignItems === a.val
                          ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7] font-semibold'
                          : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Align Content */}
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Alignement multi-lignes (align-content)
                </label>
                <select
                  value={effectiveStyle.alignContent || 'stretch'}
                  onChange={(e) => handleStyleChange('alignContent', e.target.value)}
                  className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
                >
                  <option value="stretch">Étirer les lignes (Stretch)</option>
                  <option value="flex-start">Regrouper en haut (flex-start)</option>
                  <option value="center">Regrouper au centre (center)</option>
                  <option value="flex-end">Regrouper en bas (flex-end)</option>
                  <option value="space-between">Distribuer (space-between)</option>
                  <option value="space-around">Espaces répartis (space-around)</option>
                </select>
              </div>

              {/* Espacement Flexbox (Gap Flex) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Espacement Flexbox (Gap Flex)
                  </label>
                  <InfoTooltip text="L'espace d'aération entre chaque élément enfant aligné dans ce conteneur Flexbox." />
                </div>

                <div className="grid grid-cols-5 gap-1 mb-2">
                  {['0px', '8px', '16px', '24px', '32px'].map((gVal) => (
                    <button
                      key={gVal}
                      type="button"
                      onClick={() => handleStyleChange('gap', gVal)}
                      className={`py-1 text-[10px] font-medium rounded-lg border transition-all ${
                        effectiveStyle.gap === gVal
                          ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7] font-semibold'
                          : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                      }`}
                    >
                      {gVal}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="range"
                    min="0"
                    max="64"
                    step="2"
                    value={parseInt(String(effectiveStyle.gap || '16'), 10) || 0}
                    onChange={(e) => handleStyleChange('gap', `${e.target.value}px`)}
                    className="flex-1 accent-[#5B5BF0]"
                  />
                  <span className="text-xs font-mono font-bold text-[#5B5BF0] w-12 text-right">
                    {effectiveStyle.gap || '16px'}
                  </span>
                </div>

                {/* Gap Ligne & Colonne séparés */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-0.5">
                      Gap Lignes (row-gap)
                    </label>
                    <input
                      type="text"
                      placeholder="ex: 12px"
                      value={effectiveStyle.rowGap || ''}
                      onChange={(e) => handleStyleChange('rowGap', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-0.5">
                      Gap Colonnes (column-gap)
                    </label>
                    <input
                      type="text"
                      placeholder="ex: 20px"
                      value={effectiveStyle.columnGap || ''}
                      onChange={(e) => handleStyleChange('columnGap', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= SOUS-SECTION CSS GRID ================= */}
          {(effectiveStyle.display === 'grid' || effectiveStyle.display === 'inline-grid') && (
            <div className="space-y-3 pt-2 border-t border-[#E6E6EE] dark:border-[#28283C] animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B5BF0] flex items-center gap-1">
                  📐 Options Grille CSS (Grid)
                </span>
              </div>

              {/* Grid Template Columns */}
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Colonnes de la grille (grid-template-columns)
                </label>
                <div className="grid grid-cols-2 gap-1 mb-2">
                  {[
                    { label: '2 Colonnes', val: 'repeat(2, 1fr)' },
                    { label: '3 Colonnes', val: 'repeat(3, 1fr)' },
                    { label: '4 Colonnes', val: 'repeat(4, 1fr)' },
                    { label: '⚡ Auto-Fit (Responsive)', val: 'repeat(auto-fit, minmax(220px, 1fr))' },
                    { label: '1/3 - 2/3', val: '1fr 2fr' },
                    { label: 'Sidebar + Main', val: '240px 1fr' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleStyleChange('gridTemplateColumns', preset.val)}
                      className={`py-1 px-1.5 text-[10px] font-medium rounded-lg border transition-all text-left truncate ${
                        effectiveStyle.gridTemplateColumns === preset.val
                          ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7] font-semibold'
                          : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Ex: repeat(3, 1fr) ou 200px 1fr 200px"
                  value={effectiveStyle.gridTemplateColumns || ''}
                  onChange={(e) => handleStyleChange('gridTemplateColumns', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                />
              </div>

              {/* Grid Template Rows */}
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Lignes de la grille (grid-template-rows)
                </label>
                <input
                  type="text"
                  placeholder="Ex: auto, repeat(2, 1fr), 80px 1fr 60px"
                  value={effectiveStyle.gridTemplateRows || ''}
                  onChange={(e) => handleStyleChange('gridTemplateRows', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                />
              </div>

              {/* Grid Auto Flow */}
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                  Flux automatique (grid-auto-flow)
                </label>
                <select
                  value={effectiveStyle.gridAutoFlow || 'row'}
                  onChange={(e) => handleStyleChange('gridAutoFlow', e.target.value)}
                  className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
                >
                  <option value="row">Remplir par lignes (row)</option>
                  <option value="column">Remplir par colonnes (column)</option>
                  <option value="dense">Mode compact sans trous (dense)</option>
                  <option value="row dense">Lignes compactes (row dense)</option>
                  <option value="column dense">Colonnes compactes (column dense)</option>
                </select>
              </div>

              {/* Alignement des éléments dans la grille */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-1">
                    Justify Items
                  </label>
                  <select
                    value={effectiveStyle.justifyItems || 'stretch'}
                    onChange={(e) => handleStyleChange('justifyItems', e.target.value)}
                    className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg px-2 text-[11px] text-[#1B1B2F] dark:text-[#F4F4F9]"
                  >
                    <option value="stretch">Étirer (stretch)</option>
                    <option value="start">Début (start)</option>
                    <option value="center">Centre (center)</option>
                    <option value="end">Fin (end)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-1">
                    Align Items
                  </label>
                  <select
                    value={effectiveStyle.alignItems || 'stretch'}
                    onChange={(e) => handleStyleChange('alignItems', e.target.value)}
                    className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg px-2 text-[11px] text-[#1B1B2F] dark:text-[#F4F4F9]"
                  >
                    <option value="stretch">Étirer (stretch)</option>
                    <option value="start">Haut (start)</option>
                    <option value="center">Centre (center)</option>
                    <option value="end">Bas (end)</option>
                  </select>
                </div>
              </div>

              {/* Espacement de Grille (Gap Grid) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Espacement de Grille (Gap Grid)
                  </label>
                  <InfoTooltip text="L'écartement entre les mailles (lignes et colonnes) de la grille CSS." />
                </div>

                <div className="grid grid-cols-5 gap-1 mb-2">
                  {['0px', '12px', '20px', '32px', '48px'].map((gVal) => (
                    <button
                      key={gVal}
                      type="button"
                      onClick={() => handleStyleChange('gap', gVal)}
                      className={`py-1 text-[10px] font-medium rounded-lg border transition-all ${
                        effectiveStyle.gap === gVal
                          ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7] font-semibold'
                          : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                      }`}
                    >
                      {gVal}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="range"
                    min="0"
                    max="64"
                    step="2"
                    value={parseInt(String(effectiveStyle.gap || '20'), 10) || 0}
                    onChange={(e) => handleStyleChange('gap', `${e.target.value}px`)}
                    className="flex-1 accent-[#5B5BF0]"
                  />
                  <span className="text-xs font-mono font-bold text-[#5B5BF0] w-12 text-right">
                    {effectiveStyle.gap || '20px'}
                  </span>
                </div>

                {/* Gap Ligne & Colonne de Grille séparés */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-0.5">
                      Gap Lignes (row-gap)
                    </label>
                    <input
                      type="text"
                      placeholder="ex: 16px"
                      value={effectiveStyle.rowGap || ''}
                      onChange={(e) => handleStyleChange('rowGap', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-0.5">
                      Gap Colonnes (column-gap)
                    </label>
                    <input
                      type="text"
                      placeholder="ex: 24px"
                      value={effectiveStyle.columnGap || ''}
                      onChange={(e) => handleStyleChange('columnGap', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= PROPRIÉTÉS D'ENFANT FLEX / GRID ================= */}
          <div className="space-y-3 pt-3 border-t border-[#E6E6EE] dark:border-[#28283C]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA6] dark:text-[#75758E] block">
              Propres à cet élément enfant (Flex / Grid Item)
            </span>

            {/* Flex Grow & Shrink */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-1">
                  Flex Grow (Expansion)
                </label>
                <select
                  value={effectiveStyle.flexGrow !== undefined ? String(effectiveStyle.flexGrow) : '0'}
                  onChange={(e) => handleStyleChange('flexGrow', Number(e.target.value))}
                  className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg px-2 text-[11px] text-[#1B1B2F] dark:text-[#F4F4F9]"
                >
                  <option value="0">0 (Taille fixe / Pas d'extension)</option>
                  <option value="1">1 (Remplir l'espace libre ⚡)</option>
                  <option value="2">2 (Expansion double)</option>
                  <option value="3">3 (Expansion triple)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-1">
                  Flex Shrink (Réduction)
                </label>
                <select
                  value={effectiveStyle.flexShrink !== undefined ? String(effectiveStyle.flexShrink) : '1'}
                  onChange={(e) => handleStyleChange('flexShrink', Number(e.target.value))}
                  className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg px-2 text-[11px] text-[#1B1B2F] dark:text-[#F4F4F9]"
                >
                  <option value="1">1 (Rétrécir si besoin)</option>
                  <option value="0">0 (Ne jamais rétrécir)</option>
                </select>
              </div>
            </div>

            {/* Align Self (Alignement individuel) */}
            <div>
              <label className="text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-1">
                Align Self (Surpasser alignement parent)
              </label>
              <select
                value={effectiveStyle.alignSelf || 'auto'}
                onChange={(e) => handleStyleChange('alignSelf', e.target.value === 'auto' ? undefined : e.target.value)}
                className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg px-2 text-[11px] text-[#1B1B2F] dark:text-[#F4F4F9]"
              >
                <option value="auto">Automatique (Hérité du parent)</option>
                <option value="flex-start">Début / Haut (flex-start)</option>
                <option value="center">Centre (center)</option>
                <option value="flex-end">Fin / Bas (flex-end)</option>
                <option value="stretch">Étirer (stretch)</option>
              </select>
            </div>

            {/* Extension de Colonne & Ligne sur la Grille (Grid Column & Grid Row) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-1">
                  Grid Column (Colonnes)
                </label>
                <select
                  value={effectiveStyle.gridColumn || 'auto'}
                  onChange={(e) => handleStyleChange('gridColumn', e.target.value === 'auto' ? undefined : e.target.value)}
                  className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg px-2 text-[11px] text-[#1B1B2F] dark:text-[#F4F4F9]"
                >
                  <option value="auto">Auto (1 col)</option>
                  <option value="span 2">Occuper 2 Colonnes</option>
                  <option value="span 3">Occuper 3 Colonnes</option>
                  <option value="span 4">Occuper 4 Colonnes</option>
                  <option value="1 / -1">Pleine Largeur (1 / -1 ⚡)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-1">
                  Grid Row (Lignes)
                </label>
                <select
                  value={effectiveStyle.gridRow || 'auto'}
                  onChange={(e) => handleStyleChange('gridRow', e.target.value === 'auto' ? undefined : e.target.value)}
                  className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg px-2 text-[11px] text-[#1B1B2F] dark:text-[#F4F4F9]"
                >
                  <option value="auto">Auto (1 ligne)</option>
                  <option value="span 2">Occuper 2 Lignes</option>
                  <option value="span 3">Occuper 3 Lignes</option>
                  <option value="span 4">Occuper 4 Lignes</option>
                  <option value="1 / -1">Pleine Hauteur (1 / -1 ⚡)</option>
                </select>
              </div>
            </div>

            {/* Saisie personnalisée Grid Column / Row si besoin */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="ex: 1 / 3 ou span 2"
                value={effectiveStyle.gridColumn || ''}
                onChange={(e) => handleStyleChange('gridColumn', e.target.value || undefined)}
                className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
              />
              <input
                type="text"
                placeholder="ex: 2 / 4 ou span 3"
                value={effectiveStyle.gridRow || ''}
                onChange={(e) => handleStyleChange('gridRow', e.target.value || undefined)}
                className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
              />
            </div>

            {/* Ordre visuel (Order) */}
            <div>
              <label className="text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-1">
                Ordre d'affichage (order)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0"
                  value={effectiveStyle.order !== undefined ? effectiveStyle.order : ''}
                  onChange={(e) => handleStyleChange('order', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-24 px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                />
                <span className="text-[10px] text-[#8E8EA6] dark:text-[#75758E]">
                  Ex: -1 pour placer en premier, 1 pour placer en dernier.
                </span>
              </div>
            </div>
          </div>
        </PropSection>

        {/* ================= 5. COULEURS & ARRIÈRE-PLAN (AVEC IMAGE & DÉGRADÉ) ================= */}
        <PropSection
          title="Couleurs & Arrière-plan"
          icon={<Palette className="w-3.5 h-3.5" />}
          isOpen={openSections.colors}
          onToggle={() => toggleSection('colors')}
        >
          {/* Swatches de marque rapide */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA6] dark:text-[#75758E]">
                Palette de marque du projet
              </span>
              <InfoTooltip text="Cliquez pour appliquer l'une des 5 couleurs de marque définies dans votre thème global." />
            </div>
            <div className="grid grid-cols-5 gap-1.5 p-1.5 rounded-xl bg-[#F7F7FA] dark:bg-[#202030] border border-[#E6E6EE] dark:border-[#28283C]">
              {themeColors.map((tColor) => (
                <button
                  key={tColor.name}
                  type="button"
                  onClick={() => {
                    if (element.type === 'text' || element.type === 'heading') {
                      handleStyleChange('color', tColor.color);
                    } else {
                      handleStyleChange('backgroundColor', tColor.color);
                    }
                  }}
                  title={`${tColor.name} (${tColor.color})`}
                  className="flex flex-col items-center gap-1 group p-1 rounded-lg hover:bg-white dark:hover:bg-[#181824] transition-all"
                >
                  <span
                    className="w-6 h-6 rounded-full border border-black/10 dark:border-white/10 shadow-2xs group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: tColor.color }}
                  />
                  <span className="text-[9px] font-semibold text-[#62627A] dark:text-[#A5A5BC] truncate max-w-full">
                    {tColor.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Couleur de fond */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Couleur de fond (Solid)
              </label>
              <InfoTooltip text="Couleur d'arrière-plan du bloc. Vous pouvez aussi choisir Transparent." />
            </div>
            <div className="flex items-center gap-2">
              <ColorPicker
                value={effectiveStyle.backgroundColor || '#FFFFFF'}
                onChange={(c) => handleStyleChange('backgroundColor', c)}
              />
              <button
                type="button"
                onClick={() => handleStyleChange('backgroundColor', 'transparent')}
                className="px-2 py-1.5 text-[11px] font-semibold rounded-lg border border-[#E6E6EE] dark:border-[#28283C] hover:bg-[#F7F7FA] dark:hover:bg-[#202030] text-[#62627A] dark:text-[#A5A5BC]"
              >
                Transparent
              </button>
            </div>
          </div>

          {/* Image de Fond CSS (Background Image) */}
          <div className="space-y-2 pt-2 border-t border-[#E6E6EE] dark:border-[#28283C]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#5B5BF0]" />
                <span>Image d’arrière-plan (Background Image)</span>
              </label>
              <InfoTooltip text="Définissez une image d'arrière-plan pour ce conteneur ou cette section." />
            </div>

            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="https://... (URL d'image)"
                value={
                  (effectiveStyle.backgroundImage || '')
                    .replace(/^url\(['"]?/, '')
                    .replace(/['"]?\)$/, '')
                }
                onChange={(e) => {
                  const url = e.target.value.trim();
                  if (!url) {
                    handleRemoveStyleProp('backgroundImage');
                  } else if (url.startsWith('linear-gradient') || url.startsWith('radial-gradient')) {
                    handleStyleChange('backgroundImage', url);
                  } else {
                    handleStyleChange('backgroundImage', `url('${url}')`);
                  }
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
              />

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMediaTarget('backgroundImage');
                    setIsMediaModalOpen(true);
                  }}
                  className="flex-1 text-xs flex items-center justify-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#5B5BF0]" />
                  <span>Médiathèque</span>
                </Button>
                {effectiveStyle.backgroundImage && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStyleProp('backgroundImage')}
                    className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900"
                    title="Effacer l'image de fond"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>

            {/* Dégradés CSS Prédéfinis (Linear Gradients) */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-semibold text-[#8E8EA6]">Dégradés modernes prédéfinis :</span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { name: 'Indigo', val: 'linear-gradient(135deg, #5B5BF0 0%, #14B8A6 100%)' },
                  { name: 'Sombre', val: 'linear-gradient(180deg, #1B1B2F 0%, #0F0F1A 100%)' },
                  { name: 'Sunset', val: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)' },
                  { name: 'Aurora', val: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)' },
                ].map((g) => (
                  <button
                    key={g.name}
                    type="button"
                    onClick={() => handleStyleChange('backgroundImage', g.val)}
                    style={{ background: g.val }}
                    className="h-6 rounded-lg text-[9px] font-bold text-white shadow-2xs hover:scale-105 transition-transform"
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Propriétés de fond : Size, Position, Repeat & Attachment */}
            {effectiveStyle.backgroundImage && (
              <div className="p-2.5 bg-[#F7F7FA] dark:bg-[#202030] rounded-xl border border-[#E6E6EE] dark:border-[#28283C] space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-0.5">
                      Taille (Size)
                    </label>
                    <select
                      value={effectiveStyle.backgroundSize || 'cover'}
                      onChange={(e) => handleStyleChange('backgroundSize', e.target.value)}
                      className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg text-xs"
                    >
                      <option value="cover">Ajuster (Cover)</option>
                      <option value="contain">Contenir (Contain)</option>
                      <option value="auto">Taille réelle (Auto)</option>
                      <option value="100% 100%">Étiré (100%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-0.5">
                      Position
                    </label>
                    <select
                      value={effectiveStyle.backgroundPosition || 'center'}
                      onChange={(e) => handleStyleChange('backgroundPosition', e.target.value)}
                      className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg text-xs"
                    >
                      <option value="center">Centre</option>
                      <option value="top">Haut</option>
                      <option value="bottom">Bas</option>
                      <option value="left">Gauche</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-0.5">
                      Répétition (Repeat)
                    </label>
                    <select
                      value={effectiveStyle.backgroundRepeat || 'no-repeat'}
                      onChange={(e) => handleStyleChange('backgroundRepeat', e.target.value)}
                      className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg text-xs"
                    >
                      <option value="no-repeat">Sans répétition</option>
                      <option value="repeat">Répéter (Mosaïque)</option>
                      <option value="repeat-x">Horizontale (Repeat-X)</option>
                      <option value="repeat-y">Verticale (Repeat-Y)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-0.5">
                      Effet Parallaxe (Attachment)
                    </label>
                    <select
                      value={effectiveStyle.backgroundAttachment || 'scroll'}
                      onChange={(e) => handleStyleChange('backgroundAttachment', e.target.value)}
                      className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg text-xs"
                    >
                      <option value="scroll">Normal (Scroll)</option>
                      <option value="fixed">✦ Parallaxe Fixe (Fixed)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Couleur du texte */}
          <div className="pt-2 border-t border-[#E6E6EE] dark:border-[#28283C]">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Couleur du texte
              </label>
              <InfoTooltip text="Couleur appliquée aux textes et icônes." />
            </div>
            <ColorPicker
              value={effectiveStyle.color || project.theme?.textColor || '#1B1B2F'}
              onChange={(c) => handleStyleChange('color', c)}
            />
          </div>
        </PropSection>

        {/* ================= 6. TEXTE & TYPOGRAPHIE (AVEC LETTER-SPACING, LINE-HEIGHT, TEXT-TRANSFORM) ================= */}
        {(element.type === 'text' || element.type === 'heading' || element.type === 'button') && (
          <PropSection
            title="Texte & Typographie"
            icon={<Type className="w-3.5 h-3.5" />}
            isOpen={openSections.typography}
            onToggle={() => toggleSection('typography')}
          >
            {/* Police de caractères */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                  Police d’écriture
                </label>
                <InfoTooltip text="Héritée du Thème Global par défaut, ou personnalisée pour ce bloc." />
              </div>
              <select
                value={effectiveStyle.fontFamily || (element.type === 'heading' ? 'theme-heading' : 'theme-body')}
                onChange={(e) => {
                  if (e.target.value === 'theme-heading') {
                    handleStyleChange('fontFamily', project.theme?.headingFont || 'Plus Jakarta Sans');
                  } else if (e.target.value === 'theme-body') {
                    handleStyleChange('fontFamily', project.theme?.bodyFont || 'Inter');
                  } else {
                    handleStyleChange('fontFamily', e.target.value);
                  }
                }}
                className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
              >
                <option value="theme-heading">✦ Police Titres du Thème ({project.theme?.headingFont || 'Plus Jakarta Sans'})</option>
                <option value="theme-body">✦ Police Corps du Thème ({project.theme?.bodyFont || 'Inter'})</option>
                <optgroup label="Sélection de polices soignées">
                  {HEADING_FONTS.map((f) => (
                    <option key={f.value} value={f.value}>{f.name} ({f.category})</option>
                  ))}
                  {BODY_FONTS.map((f) => (
                    <option key={f.value} value={f.value}>{f.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Taille du texte */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                  Taille du texte
                </label>
                <InfoTooltip text="Ajustez la taille en pixels. Sur mobile, vous pouvez spécifier une taille plus petite adaptée aux téléphones." />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="72"
                  step="2"
                  value={parseInt(effectiveStyle.fontSize || '16', 10) || 16}
                  onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                  className="flex-1 accent-[#5B5BF0]"
                />
                <span className="text-xs font-mono font-bold text-[#5B5BF0] w-12 text-right">
                  {effectiveStyle.fontSize || '16px'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 mt-1.5">
                {['14px', '18px', '24px', '36px'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleStyleChange('fontSize', sz)}
                    className="py-0.5 text-[10px] font-medium rounded-md border border-[#E6E6EE] dark:border-[#28283C] hover:bg-[#F7F7FA] dark:hover:bg-[#202030]"
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Graisse (Font Weight) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                  Épaisseur (Graisse)
                </label>
                <InfoTooltip text="Normal (400), Demi-gras (600), Gras (700) ou Extra-gras (800)." />
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: 'Normal', val: '400' },
                  { label: 'Médium', val: '500' },
                  { label: 'Demi-gras', val: '600' },
                  { label: 'Gras', val: '700' },
                ].map((w) => (
                  <button
                    key={w.label}
                    type="button"
                    onClick={() => handleStyleChange('fontWeight', w.val)}
                    className={`py-1 text-[11px] font-medium rounded-lg border transition-all ${
                      effectiveStyle.fontWeight === w.val
                        ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7]'
                        : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alignement du texte */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                  Alignement du texte
                </label>
                <InfoTooltip text="Gauche, Centre, Droite ou Justifié." />
              </div>
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#F7F7FA] dark:bg-[#202030] border border-[#E6E6EE] dark:border-[#28283C]">
                {[
                  { icon: <AlignLeft className="w-3.5 h-3.5" />, val: 'left' },
                  { icon: <AlignCenter className="w-3.5 h-3.5" />, val: 'center' },
                  { icon: <AlignRight className="w-3.5 h-3.5" />, val: 'right' },
                  { icon: <AlignJustify className="w-3.5 h-3.5" />, val: 'justify' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => handleStyleChange('textAlign', item.val)}
                    className={`py-1.5 flex items-center justify-center rounded-lg transition-all ${
                      effectiveStyle.textAlign === item.val
                        ? 'bg-white dark:bg-[#181824] text-[#5B5BF0] dark:text-[#6B6BF7] shadow-xs font-bold'
                        : 'text-[#8E8EA6]'
                    }`}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Options avancées de texte : Hauteur de ligne, Letter-spacing, Casse & Décoration */}
            <div className="p-2.5 bg-[#F7F7FA] dark:bg-[#202030] rounded-xl border border-[#E6E6EE] dark:border-[#28283C] space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-0.5">
                    Hauteur de ligne (Line-height)
                  </label>
                  <select
                    value={effectiveStyle.lineHeight || '1.5'}
                    onChange={(e) => handleStyleChange('lineHeight', e.target.value)}
                    className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg text-xs"
                  >
                    <option value="1">Serré (1.0)</option>
                    <option value="1.2">Compact (1.2)</option>
                    <option value="1.5">Standard (1.5)</option>
                    <option value="1.8">Aéré (1.8)</option>
                    <option value="2">Très aéré (2.0)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-0.5">
                    Espacement lettres (Tracking)
                  </label>
                  <select
                    value={effectiveStyle.letterSpacing || 'normal'}
                    onChange={(e) => handleStyleChange('letterSpacing', e.target.value)}
                    className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg text-xs"
                  >
                    <option value="-0.05em">Compact (-0.05em)</option>
                    <option value="normal">Normal</option>
                    <option value="0.05em">Aéré (0.05em)</option>
                    <option value="0.1em">Espacé (0.1em)</option>
                    <option value="0.2em">MAJUSCULES (0.2em)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-0.5">
                    Casse du texte (Transform)
                  </label>
                  <select
                    value={effectiveStyle.textTransform || 'none'}
                    onChange={(e) => handleStyleChange('textTransform', e.target.value)}
                    className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg text-xs"
                  >
                    <option value="none">Normal</option>
                    <option value="uppercase">MAJUSCULES</option>
                    <option value="lowercase">minuscules</option>
                    <option value="capitalize">Première Lettre En Capitale</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#62627A] dark:text-[#A5A5BC] block mb-0.5">
                    Ligne de décoration
                  </label>
                  <select
                    value={effectiveStyle.textDecoration || 'none'}
                    onChange={(e) => handleStyleChange('textDecoration', e.target.value)}
                    className="w-full h-7 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-lg text-xs"
                  >
                    <option value="none">Aucune</option>
                    <option value="underline">Souligné</option>
                    <option value="line-through">Barré</option>
                  </select>
                </div>
              </div>
            </div>
          </PropSection>
        )}

        {/* ================= 7. BORDURE & ARRONDI DES COINS ================= */}
        <PropSection
          title="Bordure & Arrondi (Coins)"
          icon={<Square className="w-3.5 h-3.5" />}
          isOpen={openSections.border}
          onToggle={() => toggleSection('border')}
        >
          {/* Rayon des coins Global */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Arrondi des coins (Border Radius)
              </label>
              <span className="text-xs font-mono font-bold text-[#5B5BF0] dark:text-[#7D7DF8]">
                {effectiveStyle.borderRadius || '0px'}
              </span>
            </div>

            {/* Boutons de présélection rapide */}
            <div className="grid grid-cols-6 gap-1">
              {[
                { label: '0px', val: '0px' },
                { label: '4px', val: '4px' },
                { label: '8px', val: '8px' },
                { label: '12px', val: '12px' },
                { label: '16px', val: '16px' },
                { label: '24px', val: '24px' },
              ].map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => handleStyleChange('borderRadius', r.val)}
                  className={`py-1 text-[10px] font-semibold rounded-lg border transition-all ${
                    effectiveStyle.borderRadius === r.val
                      ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7] font-bold'
                      : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStyleChange('borderRadius', '9999px')}
                className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all ${
                  effectiveStyle.borderRadius === '9999px'
                    ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038]'
                    : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                }`}
              >
                🔴 Pilule / Cercle (9999px)
              </button>

              <input
                type="text"
                placeholder="ex: 12px ou 50%"
                value={effectiveStyle.borderRadius || ''}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
              />
            </div>

            {/* Curseur Slider interactif pour Border Radius */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-[#8E8EA6]">0</span>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={parseInt(String(effectiveStyle.borderRadius || '0'), 10) || 0}
                onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)}
                className="flex-1 accent-[#5B5BF0] h-1.5 bg-[#E6E6EE] dark:bg-[#28283C] rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-[#8E8EA6]">60px</span>
            </div>

            {/* Contrôle détaillé coin par coin */}
            <details className="group pt-2 border-t border-[#E6E6EE] dark:border-[#28283C]">
              <summary className="text-[11px] font-bold text-[#62627A] dark:text-[#A5A5BC] cursor-pointer hover:text-[#5B5BF0] list-none flex items-center justify-between">
                <span>✦ Arrondis par coin individuel</span>
                <span className="text-[10px]">▼</span>
              </summary>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-[#8E8EA6] block mb-0.5">
                    Haut-Gauche (TL)
                  </label>
                  <input
                    type="text"
                    placeholder="0px"
                    value={effectiveStyle.borderTopLeftRadius || ''}
                    onChange={(e) => handleStyleChange('borderTopLeftRadius', e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#8E8EA6] block mb-0.5">
                    Haut-Droit (TR)
                  </label>
                  <input
                    type="text"
                    placeholder="0px"
                    value={effectiveStyle.borderTopRightRadius || ''}
                    onChange={(e) => handleStyleChange('borderTopRightRadius', e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#8E8EA6] block mb-0.5">
                    Bas-Gauche (BL)
                  </label>
                  <input
                    type="text"
                    placeholder="0px"
                    value={effectiveStyle.borderBottomLeftRadius || ''}
                    onChange={(e) => handleStyleChange('borderBottomLeftRadius', e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#8E8EA6] block mb-0.5">
                    Bas-Droit (BR)
                  </label>
                  <input
                    type="text"
                    placeholder="0px"
                    value={effectiveStyle.borderBottomRightRadius || ''}
                    onChange={(e) => handleStyleChange('borderBottomRightRadius', e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C]"
                  />
                </div>
              </div>
            </details>
          </div>

          {/* Bordure : Épaisseur, style et couleur */}
          <div className="pt-2 border-t border-[#E6E6EE] dark:border-[#28283C] space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Style de bordure & Contour
              </label>
              <InfoTooltip text="Ajoute une ligne de contour solide ou pointillée autour de l'élément." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={effectiveStyle.borderStyle || 'none'}
                onChange={(e) => handleStyleChange('borderStyle', e.target.value)}
                className="h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
              >
                <option value="none">Sans bordure</option>
                <option value="solid">Ligne solide</option>
                <option value="dashed">Tirets</option>
                <option value="dotted">Pointillés</option>
                <option value="double">Ligne double</option>
              </select>

              <input
                type="text"
                placeholder="Épaisseur (ex: 2px)"
                value={effectiveStyle.borderWidth || ''}
                onChange={(e) => handleStyleChange('borderWidth', e.target.value)}
                className="px-2.5 py-1 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
              />
            </div>

            {effectiveStyle.borderStyle && effectiveStyle.borderStyle !== 'none' && (
              <div className="mt-2">
                <ColorPicker
                  label="Couleur de bordure"
                  value={effectiveStyle.borderColor || '#E6E6EE'}
                  onChange={(c) => handleStyleChange('borderColor', c)}
                />
              </div>
            )}
          </div>
        </PropSection>

        {/* ================= 8. OMBRE PORTÉE ================= */}
        <PropSection
          title="Ombre & Relief"
          icon={<Sun className="w-3.5 h-3.5" />}
          isOpen={openSections.shadow}
          onToggle={() => toggleSection('shadow')}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Style d’ombre
              </label>
              <InfoTooltip text="Ombre portée : donne de la profondeur et du relief au bloc pour le faire ressortir." />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Aucune', val: 'none' },
                { label: 'Subtile (Légère)', val: '0 1px 3px rgba(0,0,0,0.08)' },
                { label: 'Douce (Élégante)', val: '0 8px 24px -4px rgba(0,0,0,0.1)' },
                { label: 'Flottante (3D)', val: '0 20px 40px -8px rgba(0,0,0,0.16)' },
                { label: 'Lueur Marque', val: `0 8px 24px -2px ${project.theme?.primaryColor || '#5B5BF0'}40` },
              ].map((sh) => (
                <button
                  key={sh.label}
                  type="button"
                  onClick={() => handleStyleChange('boxShadow', sh.val)}
                  className={`p-2 text-[11px] font-medium text-left rounded-xl border transition-all ${
                    effectiveStyle.boxShadow === sh.val
                      ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7] font-bold'
                      : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                  }`}
                >
                  {sh.label}
                </button>
              ))}
            </div>
          </div>
        </PropSection>

        {/* ================= 9. EFFETS, CURSEUR, ASPECT RATIO & FILTRES CSS ================= */}
        <PropSection
          title="Effets, Curseur & Filtres CSS"
          icon={<Sparkles className="w-3.5 h-3.5" />}
          isOpen={openSections.effects}
          onToggle={() => toggleSection('effects')}
        >
          {/* Ratio d'aspect (Aspect Ratio) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Ratio de proportion (Aspect Ratio)
              </label>
              <InfoTooltip text="Verrouille les proportions géométriques du bloc (1/1 pour carré, 16/9 pour vidéo, etc.)." />
            </div>
            <select
              value={effectiveStyle.aspectRatio || 'auto'}
              onChange={(e) => handleStyleChange('aspectRatio', e.target.value)}
              className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
            >
              <option value="auto">Automatique (Libre)</option>
              <option value="1 / 1">1:1 (Carré parfait)</option>
              <option value="16 / 9">16:9 (Format Vidéo HD)</option>
              <option value="4 / 3">4:3 (Photo classique)</option>
              <option value="21 / 9">21:9 (Cinéma ultra-large)</option>
              <option value="9 / 16">9:16 (Format Story / Mobile)</option>
            </select>
          </div>

          {/* Débordement (Overflow) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Gestion du débordement (Overflow)
              </label>
              <InfoTooltip text="Masqué (hidden) pour couper ce qui dépasse, ou Défilement (auto) pour afficher un ascenseur interne." />
            </div>
            <select
              value={effectiveStyle.overflow || 'visible'}
              onChange={(e) => handleStyleChange('overflow', e.target.value)}
              className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
            >
              <option value="visible">Visible (Laisse dépasser)</option>
              <option value="hidden">Masqué (Cogne aux bords / Clip)</option>
              <option value="auto">Défilement auto (Scrollbar)</option>
              <option value="scroll">Défilement forcé</option>
            </select>
          </div>

          {/* Curseur au survol (Cursor) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Curseur de la souris (Cursor)
              </label>
              <InfoTooltip text="Pointeur (Main), Texte (I-beam), Interdit, Zoom, Grab, etc." />
            </div>
            <select
              value={effectiveStyle.cursor || 'default'}
              onChange={(e) => handleStyleChange('cursor', e.target.value)}
              className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
            >
              <option value="default">Par défaut (Flèche)</option>
              <option value="pointer">👆 Main cliquable (Pointer)</option>
              <option value="text">✍️ Sélection de texte (Text)</option>
              <option value="not-allowed">🚫 Interdit (Not-allowed)</option>
              <option value="grab">✋ Main ouverte (Grab)</option>
              <option value="zoom-in">🔍 Loupe Zoom (Zoom-in)</option>
            </select>
          </div>

          {/* Opacité */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Opacité globale
              </label>
              <InfoTooltip text="Permet de rendre l'élément semi-transparent de 0% à 100%." />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={effectiveStyle.opacity !== undefined ? Number(effectiveStyle.opacity) : 1}
                onChange={(e) => handleStyleChange('opacity', Number(e.target.value))}
                className="flex-1 accent-[#5B5BF0]"
              />
              <span className="text-xs font-mono font-bold text-[#5B5BF0] w-10 text-right">
                {Math.round((effectiveStyle.opacity !== undefined ? Number(effectiveStyle.opacity) : 1) * 100)}%
              </span>
            </div>
          </div>

          {/* Filtres visuels CSS (Filters) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Filtre visuel (Filter)
              </label>
              <InfoTooltip text="Filtre visuel direct : Flou, Niveaux de gris, Contraste, Sépia, etc." />
            </div>
            <select
              value={effectiveStyle.filter || 'none'}
              onChange={(e) => handleStyleChange('filter', e.target.value)}
              className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
            >
              <option value="none">Aucun filtre</option>
              <option value="grayscale(100%)">Noir & Blanc (Grayscale 100%)</option>
              <option value="blur(4px)">Flou artistique (Blur 4px)</option>
              <option value="brightness(125%)">Luminosité boostée (+25%)</option>
              <option value="contrast(130%)">Haute Contraste (130%)</option>
              <option value="sepia(80%)">Rétro Sépia (80%)</option>
            </select>
          </div>

          {/* Verre dépoli (Backdrop blur) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Effet Verre Dépoli (Glassmorphism)
              </label>
              <InfoTooltip text="Floute élégamment l'arrière-plan visible sous cet élément." />
            </div>
            <select
              value={effectiveStyle.backdropFilter || 'none'}
              onChange={(e) => handleStyleChange('backdropFilter', e.target.value)}
              className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
            >
              <option value="none">Désactivé</option>
              <option value="blur(6px)">Flou léger (6px)</option>
              <option value="blur(16px)">Flou moderne (16px)</option>
              <option value="blur(30px)">Flou prononcé (30px)</option>
            </select>
          </div>
        </PropSection>

        {/* ================= 10. ANIMATION D'APPARITION AU DÉFILEMENT ================= */}
        <PropSection
          title="Animation au défilement"
          icon={<Film className="w-3.5 h-3.5" />}
          isOpen={openSections.animation}
          onToggle={() => toggleSection('animation')}
        >
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                  Type d’apparition (Scroll)
                </label>
                <InfoTooltip text="Animation d'apparition : Effet visuel élégant qui se déclenche lorsque le visiteur fait défiler la page jusqu'à cet élément." />
              </div>
              <select
                value={element.props?.animationType || 'none'}
                onChange={(e) => handlePropChange('animationType', e.target.value)}
                className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
              >
                <option value="none">Aucune animation</option>
                <option value="fade-in">Fondu doux (Fade in)</option>
                <option value="slide-up">Glissement vers le haut (Slide up)</option>
                <option value="slide-left">Glissement depuis la gauche</option>
                <option value="zoom-in">Zoom avant subtil (Scale up)</option>
                <option value="bounce">Rebond dynamique</option>
              </select>
            </div>

            {element.props?.animationType && element.props?.animationType !== 'none' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC]">
                    Délai d’attente
                  </label>
                  <select
                    value={element.props?.animationDelay || '0s'}
                    onChange={(e) => handlePropChange('animationDelay', e.target.value)}
                    className="w-full h-8 mt-1 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
                  >
                    <option value="0s">Instantané (0s)</option>
                    <option value="0.2s">Léger retard (0.2s)</option>
                    <option value="0.4s">Retard moyen (0.4s)</option>
                    <option value="0.6s">Retard fort (0.6s)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC]">
                    Vitesse d’animation
                  </label>
                  <select
                    value={element.props?.animationDuration || '0.5s'}
                    onChange={(e) => handlePropChange('animationDuration', e.target.value)}
                    className="w-full h-8 mt-1 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
                  >
                    <option value="0.3s">Rapide (0.3s)</option>
                    <option value="0.5s">Fluide (0.5s)</option>
                    <option value="0.8s">Douce (0.8s)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </PropSection>

        {/* ================= 11. LIEN & INTERACTION ================= */}
        <PropSection
          title="Lien & Navigation"
          icon={<Link className="w-3.5 h-3.5" />}
          isOpen={openSections.link}
          onToggle={() => toggleSection('link')}
        >
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                  Lien vers une page du projet
                </label>
                <DidacticHelp
                  title="Lien de navigation"
                  explanation="Permet à l’utilisateur de sauter vers une autre page quand il clique sur cet élément."
                  concreteExample="Lier un bouton 'Voir mes projets' directement vers la page /portfolio."
                  animationType="click"
                />
              </div>
              <select
                value={element.props?.targetPageId || ''}
                onChange={(e) => {
                  handlePropChange('targetPageId', e.target.value);
                  if (e.target.value) {
                    const targetPage = project.pages.find((p) => p.id === e.target.value);
                    if (targetPage) {
                      handlePropChange('linkUrl', `/${targetPage.slug}`);
                    }
                  }
                }}
                className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
              >
                <option value="">-- Choisir une page du projet --</option>
                {project.pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (/{p.slug}) {p.isHome ? '★ Accueil' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                  Ou lien URL externe / ancre
                </label>
                <InfoTooltip text="Ex: https://google.com ou #contact" />
              </div>
              <input
                type="text"
                placeholder="https://... ou #section"
                value={element.props?.linkUrl || ''}
                onChange={(e) => handlePropChange('linkUrl', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="target-blank-checkbox"
                checked={element.props?.openInNewTab || false}
                onChange={(e) => handlePropChange('openInNewTab', e.target.checked)}
                className="rounded accent-[#5B5BF0]"
              />
              <label htmlFor="target-blank-checkbox" className="text-xs text-[#62627A] dark:text-[#A5A5BC] cursor-pointer">
                Ouvrir dans un nouvel onglet
              </label>
            </div>
          </div>
        </PropSection>

        {/* ================= 12. MODE AVANCÉ : CODE SOURCE & DÉTAILS ================= */}
        {experienceMode === 'advanced' && (
          <PropSection
            title="Code Source (Mode Avancé)"
            icon={<Code className="w-3.5 h-3.5 text-amber-500" />}
            badge={
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                PRO
              </span>
            }
            isOpen={openSections.advancedCode}
            onToggle={() => toggleSection('advancedCode')}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#8E8EA6]">
                <span>Définition JSON de l’élément :</span>
                <span className="font-mono text-[10px]">ID: {element.id}</span>
              </div>
              <pre className="p-3 rounded-xl bg-[#11111A] text-[#10B981] font-mono text-[10px] overflow-x-auto max-h-48 border border-[#2E2E42] select-text">
                {JSON.stringify(
                  {
                    id: element.id,
                    type: element.type,
                    props: element.props,
                    style: element.style,
                    bindings: element.bindings,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </PropSection>
        )}
      </div>

      {/* Modale de la Médiathèque pour insérer directement une image */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(media) => {
          if (mediaTarget === 'backgroundImage') {
            handleStyleChange('backgroundImage', `url('${media.url}')`);
          } else {
            handlePropChange('src', media.url);
            if (media.alt && !element.props?.alt) {
              handlePropChange('alt', media.alt);
            }
          }
        }}
        title={mediaTarget === 'backgroundImage' ? "Sélectionner une image d'arrière-plan" : "Sélectionner une image pour cet élément"}
      />
    </aside>
  );
}
