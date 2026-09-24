'use client';

import * as React from 'react';
import { useAppStore } from '@/src/core/store';
import {
  ELEMENT_DEFINITIONS,
  SECTION_TEMPLATES,
  STOCK_PHOTOS,
  ElementTypeDef,
} from './editorElements';
import { Element, Page, ProjectTheme } from '@/src/core/types';
import {
  Layers,
  LayoutGrid,
  Sparkles,
  Image as ImageIcon,
  Files,
  Search,
  Plus,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Box,
  Heading,
  AlignLeft,
  MousePointerClick,
  Video,
  Square,
  FileText,
  FormInput,
  CheckSquare,
  ListFilter,
  Columns3,
  LayoutTemplate,
  Check,
  Palette,
  Type,
  Home,
  Star,
  Sparkle,
  Sliders,
  HelpCircle,
  GripVertical,
  Database,
  Tag,
  Code,
  Link2,
  Minus,
  Quote,
  FileCode,
  Table as TableIcon,
  Volume2,
  Globe,
} from 'lucide-react';
import { Button, Input, ColorPicker } from '@/src/shared/ui';
import { HEADING_FONTS, BODY_FONTS, THEME_PRESETS } from '@/src/core/themePresets';
import { t } from '@/src/i18n';

// Résolution dynamique des icônes Lucide
const iconMap: Record<string, React.ReactNode> = {
  LayoutTemplate: <LayoutTemplate className="w-4 h-4" />,
  Columns3: <Columns3 className="w-4 h-4" />,
  Box: <Box className="w-4 h-4" />,
  Heading: <Heading className="w-4 h-4" />,
  AlignLeft: <AlignLeft className="w-4 h-4" />,
  MousePointerClick: <MousePointerClick className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Image: <ImageIcon className="w-4 h-4" />,
  Video: <Video className="w-4 h-4" />,
  Square: <Square className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  FormInput: <FormInput className="w-4 h-4" />,
  CheckSquare: <CheckSquare className="w-4 h-4" />,
  ListFilter: <ListFilter className="w-4 h-4" />,
  Tag: <Tag className="w-4 h-4" />,
  Code: <Code className="w-4 h-4" />,
  Link2: <Link2 className="w-4 h-4" />,
  Minus: <Minus className="w-4 h-4" />,
  Quote: <Quote className="w-4 h-4" />,
  FileCode: <FileCode className="w-4 h-4" />,
  Table: <TableIcon className="w-4 h-4" />,
  ChevronDown: <ChevronDown className="w-4 h-4" />,
  Volume2: <Volume2 className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />,
};

export function EditorLeftPanel() {
  const {
    project,
    activePageId,
    setActivePageId,
    activeLeftTab,
    setActiveLeftTab,
    addPage,
    addDynamicPage,
    duplicatePage,
    deletePage,
    renamePage,
    setHomePage,
    movePageOrder,
    updateProjectTheme,
    applyThemePreset,
    insertElementToActivePage,
    selectedElementId,
    selectElement,
    lockElement,
    hideElement,
    deleteElement,
    renameElement,
    moveElementOrder,
    reorderElementInTree,
    setDraggedElementType,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [customImageUrl, setCustomImageUrl] = React.useState('');

  const activePage = project.pages.find((p) => p.id === activePageId) || project.pages[0];

  // Gestion de la création de page
  const [isAddingPage, setIsAddingPage] = React.useState(false);
  const [newPageName, setNewPageName] = React.useState('');
  const [isDynamicMode, setIsDynamicMode] = React.useState(false);
  const [selectedDynCollectionId, setSelectedDynCollectionId] = React.useState('');
  const [selectedDynSlugField, setSelectedDynSlugField] = React.useState('nom');

  // Gestion du renommage en ligne d'une page
  const [editingPageId, setEditingPageId] = React.useState<string | null>(null);
  const [editingPageName, setEditingPageName] = React.useState('');

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPageName.trim()) {
      if (isDynamicMode) {
        addDynamicPage(
          newPageName.trim(),
          selectedDynCollectionId || project.collections?.[0]?.id,
          selectedDynSlugField || 'nom'
        );
      } else {
        addPage(newPageName.trim());
      }
      setNewPageName('');
      setIsAddingPage(false);
      setIsDynamicMode(false);
    }
  };

  const handleSavePageRename = (pageId: string) => {
    if (editingPageName.trim()) {
      renamePage(pageId, editingPageName.trim());
    }
    setEditingPageId(null);
  };

  // Filtrage des éléments
  const filteredElements = React.useMemo(() => {
    if (!searchQuery.trim()) return ELEMENT_DEFINITIONS;
    const q = searchQuery.toLowerCase();
    return ELEMENT_DEFINITIONS.filter(
      (el) =>
        el.defaultLabel.toLowerCase().includes(q) ||
        el.description.toLowerCase().includes(q) ||
        el.categoryLabel.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Groupement par catégorie
  const categories = React.useMemo(() => {
    const map = new Map<string, ElementTypeDef[]>();
    filteredElements.forEach((el) => {
      const list = map.get(el.categoryLabel) || [];
      list.push(el);
      map.set(el.categoryLabel, list);
    });
    return Array.from(map.entries());
  }, [filteredElements]);

  return (
    <aside className="w-80 bg-white dark:bg-[#181824] border-r border-[#E6E6EE] dark:border-[#28283C] flex flex-col h-full select-none shrink-0 z-20">
      {/* Barre d'onglets principale */}
      <div className="flex items-center justify-between border-b border-[#E6E6EE] dark:border-[#28283C] p-1 bg-[#F7F7FA] dark:bg-[#1E1E2E]">
        {[
          { id: 'elements', label: 'Éléments', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
          { id: 'templates', label: 'Modèles', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'theme', label: 'Thème', icon: <Palette className="w-3.5 h-3.5" /> },
          { id: 'layers', label: 'Calques', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'pages', label: 'Pages', icon: <Files className="w-3.5 h-3.5" /> },
          { id: 'media', label: 'Images', icon: <ImageIcon className="w-3.5 h-3.5" /> },
        ].map((tab) => {
          const isActive = activeLeftTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveLeftTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                isActive
                  ? 'bg-white dark:bg-[#28283C] text-[#5B5BF0] dark:text-[#6B6BF7] shadow-2xs font-bold'
                  : 'text-[#62627A] dark:text-[#8E8EA6] hover:text-[#1B1B2F] dark:hover:text-[#F4F4F9] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="mb-0.5">{tab.icon}</span>
              <span className="truncate max-w-[42px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* ================= ONGLET 1 : ÉLÉMENTS ================= */}
        {activeLeftTab === 'elements' && (
          <div className="space-y-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8EA6]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un composant..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F7FA] dark:bg-[#202030] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl text-[#1B1B2F] dark:text-[#F4F4F9] placeholder-[#8E8EA6] outline-none focus:border-[#5B5BF0]"
              />
            </div>

            {/* Liste groupée par catégorie */}
            {categories.map(([category, items]) => (
              <div key={category} className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA6] dark:text-[#75758E] px-1">
                  {category}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {items.map((def) => (
                    <div
                      key={def.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', def.type);
                        setDraggedElementType(def.type);
                      }}
                      onDragEnd={() => setDraggedElementType(null)}
                      onClick={() => {
                        const newEl = def.createElement();
                        insertElementToActivePage(newEl);
                      }}
                      className="group flex items-center gap-2 p-2 rounded-xl border border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#1A1A28] hover:border-[#5B5BF0] dark:hover:border-[#6B6BF7] hover:bg-[#EEF0FE]/30 dark:hover:bg-[#202038] cursor-grab active:cursor-grabbing shadow-2xs hover:shadow-xs transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#F7F7FA] dark:bg-[#222234] flex items-center justify-center text-[#5B5BF0] group-hover:scale-110 transition-transform">
                        {iconMap[def.iconName] || <Box className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] truncate">
                          {def.defaultLabel}
                        </div>
                        <div className="text-[10px] text-[#8E8EA6] dark:text-[#75758E] truncate">
                          {def.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= ONGLET 2 : MODÈLES DE SECTIONS ================= */}
        {activeLeftTab === 'templates' && (
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA6] dark:text-[#75758E] px-1">
              Sections prêtes à l’emploi
            </span>

            <div className="space-y-2.5">
              {SECTION_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    const sectionEl = tmpl.createSection();
                    insertElementToActivePage(sectionEl);
                  }}
                  className="group p-3 rounded-xl border border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#1A1A28] hover:border-[#5B5BF0] hover:bg-[#EEF0FE]/20 dark:hover:bg-[#202038] cursor-pointer shadow-2xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9] group-hover:text-[#5B5BF0] transition-colors">
                      {tmpl.name}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-[#5B5BF0] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-[#8E8EA6] dark:text-[#75758E] leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= ONGLET 3 : THÈME GLOBAL DU PROJET ================= */}
        {activeLeftTab === 'theme' && (
          <div className="space-y-5">
            {/* Bannière explicative */}
            <div className="p-3 rounded-xl bg-[#EEF0FE]/60 dark:bg-[#202038] border border-[#5B5BF0]/20 text-[11px] text-[#1B1B2F] dark:text-[#F4F4F9]">
              <div className="font-bold flex items-center gap-1.5 text-[#5B5BF0] dark:text-[#7D7DF8] mb-1">
                <Sparkle className="w-3.5 h-3.5" /> Thème Global de Marque
              </div>
              <p className="text-[#62627A] dark:text-[#A5A5BC] leading-relaxed">
                Toute modification effectuée ici s’applique instantanément à l’ensemble des pages et des composants du site.
              </p>
            </div>

            {/* Presets rapides de thèmes */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA6] dark:text-[#75758E] px-1">
                Palettes & Styles Prêts à l’Emploi
              </span>

              <div className="grid grid-cols-2 gap-2">
                {THEME_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyThemePreset(p.id)}
                    className="p-2.5 rounded-xl border border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#1A1A28] hover:border-[#5B5BF0] text-left transition-all group"
                  >
                    <div className="flex items-center gap-1 mb-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: p.theme.primaryColor }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: p.theme.accentColor }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: p.theme.textColor }}
                      />
                    </div>
                    <div className="text-[11px] font-bold text-[#1B1B2F] dark:text-[#F4F4F9] group-hover:text-[#5B5BF0] truncate">
                      {p.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Palette de Marque (5 Couleurs) */}
            <div className="space-y-3 pt-2 border-t border-[#E6E6EE] dark:border-[#28283C]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA6] dark:text-[#75758E] px-1">
                1. Palette de Marque (5 Couleurs)
              </span>

              <div className="space-y-2">
                <ColorPicker
                  label="Couleur Primaire (Boutons & Actions)"
                  value={project.theme?.primaryColor || '#5B5BF0'}
                  onChange={(c) => updateProjectTheme({ primaryColor: c })}
                />
                <ColorPicker
                  label="Couleur Accent (Badges & Éléments forts)"
                  value={project.theme?.accentColor || '#14B8A6'}
                  onChange={(c) => updateProjectTheme({ accentColor: c })}
                />
                <ColorPicker
                  label="Arrière-plan Global (Fond du site)"
                  value={project.theme?.backgroundColor || '#F7F7FA'}
                  onChange={(c) => updateProjectTheme({ backgroundColor: c })}
                />
                <ColorPicker
                  label="Couleur Surface (Cartes & Blocs)"
                  value={project.theme?.surfaceColor || '#FFFFFF'}
                  onChange={(c) => updateProjectTheme({ surfaceColor: c })}
                />
                <ColorPicker
                  label="Couleur du Texte (Par défaut)"
                  value={project.theme?.textColor || '#1B1B2F'}
                  onChange={(c) => updateProjectTheme({ textColor: c })}
                />
              </div>
            </div>

            {/* 2. Typographie du projet (2 Polices élégantes) */}
            <div className="space-y-3 pt-2 border-t border-[#E6E6EE] dark:border-[#28283C]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA6] dark:text-[#75758E] px-1">
                2. Typographie du Projet
              </span>

              {/* Police des titres */}
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] mb-1 block">
                  Police des Titres (Headings)
                </label>
                <select
                  value={project.theme?.headingFont || 'Plus Jakarta Sans'}
                  onChange={(e) => updateProjectTheme({ headingFont: e.target.value })}
                  className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
                >
                  {HEADING_FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
                <div
                  className="mt-1.5 p-2 rounded-lg bg-[#F7F7FA] dark:bg-[#202030] text-sm font-bold truncate text-[#1B1B2F] dark:text-[#F4F4F9]"
                  style={{ fontFamily: project.theme?.headingFont || 'Plus Jakarta Sans' }}
                >
                  Aperçu : Un Grand Titre Percutant
                </div>
              </div>

              {/* Police de corps */}
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] mb-1 block">
                  Police de Corps de Texte (Body)
                </label>
                <select
                  value={project.theme?.bodyFont || 'Inter'}
                  onChange={(e) => updateProjectTheme({ bodyFont: e.target.value })}
                  className="w-full h-8 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl px-2.5 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]"
                >
                  {BODY_FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <div
                  className="mt-1.5 p-2 rounded-lg bg-[#F7F7FA] dark:bg-[#202030] text-xs leading-relaxed text-[#62627A] dark:text-[#A5A5BC]"
                  style={{ fontFamily: project.theme?.bodyFont || 'Inter' }}
                >
                  Aperçu : La typographie reflète la clarté et l’élégance de votre marque.
                </div>
              </div>
            </div>

            {/* 3. Styles globaux des boutons */}
            <div className="space-y-3 pt-2 border-t border-[#E6E6EE] dark:border-[#28283C]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA6] dark:text-[#75758E] px-1">
                3. Style Global des Boutons
              </span>

              {/* Arrondi des boutons */}
              <div>
                <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] mb-1.5 block">
                  Arrondi par défaut des boutons
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'Carré', r: 0 },
                    { label: 'Doux (8px)', r: 8 },
                    { label: 'Moderne (12px)', r: 12 },
                    { label: 'Pilule', r: 9999 },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={() => updateProjectTheme({ buttonRadius: btn.r })}
                      className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                        project.theme?.buttonRadius === btn.r
                          ? 'border-[#5B5BF0] bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#202038] dark:text-[#6B6BF7]'
                          : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] text-[#62627A] dark:text-[#A5A5BC]'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Démonstration en direct du bouton thème */}
              <div className="pt-2 flex flex-col items-center gap-2">
                <span className="text-[10px] text-[#8E8EA6] dark:text-[#75758E]">
                  Aperçu du bouton configuré :
                </span>
                <button
                  type="button"
                  style={{
                    backgroundColor: project.theme?.primaryColor || '#5B5BF0',
                    borderRadius: `${project.theme?.buttonRadius ?? 12}px`,
                    fontFamily: project.theme?.bodyFont || 'Inter',
                  }}
                  className="px-5 py-2 text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all"
                >
                  Bouton Principal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= ONGLET 4 : CALQUES ================= */}
        {activeLeftTab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Arborescence : « {activePage?.name} »
              </span>
              <span className="text-[10px] text-[#8E8EA6] dark:text-[#75758E]">
                Double-clic pour renommer
              </span>
            </div>

            <div className="space-y-1">
              <LayerTreeItem
                element={activePage.root}
                depth={0}
                selectedId={selectedElementId}
                onSelect={(id) => selectElement(id)}
                onLock={lockElement}
                onHide={hideElement}
                onDelete={deleteElement}
                onRename={renameElement}
                onMove={moveElementOrder}
              />
            </div>
          </div>
        )}

        {/* ================= ONGLET 5 : GESTION DES PAGES ================= */}
        {activeLeftTab === 'pages' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Pages du site ({project.pages.length})
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddingPage(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Page
              </Button>
            </div>

            {/* Formulaire d'ajout de page */}
            {isAddingPage && (
              <form
                onSubmit={handleCreatePage}
                className="p-3 rounded-xl border border-[#5B5BF0] bg-[#EEF0FE]/40 dark:bg-[#202038] space-y-3 animate-in fade-in"
              >
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C]">
                  <button
                    type="button"
                    onClick={() => setIsDynamicMode(false)}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                      !isDynamicMode
                        ? 'bg-[#5B5BF0] text-white'
                        : 'text-[#62627A] dark:text-[#8E8EA6] hover:text-[#1B1B2F]'
                    }`}
                  >
                    Page standard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDynamicMode(true);
                      if (!selectedDynCollectionId && project.collections?.[0]) {
                        setSelectedDynCollectionId(project.collections[0].id);
                      }
                    }}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-md flex items-center justify-center gap-1 transition-colors ${
                      isDynamicMode
                        ? 'bg-[#5B5BF0] text-white'
                        : 'text-[#62627A] dark:text-[#8E8EA6] hover:text-[#1B1B2F]'
                    }`}
                  >
                    <Database className="w-3 h-3" />
                    Modèle CMS
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block mb-1">
                    {isDynamicMode ? 'Nom du modèle de page' : 'Nom de la nouvelle page'}
                  </label>
                  <input
                    type="text"
                    placeholder={isDynamicMode ? 'Ex: Fiche Produit, Article' : 'Ex: À Propos, Tarifs, Galerie'}
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    autoFocus
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#181824] rounded-lg border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                  />
                </div>

                {isDynamicMode && (
                  <div className="space-y-2 p-2.5 rounded-lg bg-[#5B5BF0]/5 border border-[#5B5BF0]/20">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#5B5BF0] block mb-1">
                        Collection liée
                      </label>
                      <select
                        value={selectedDynCollectionId || project.collections?.[0]?.id || ''}
                        onChange={(e) => setSelectedDynCollectionId(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white dark:bg-[#181824] rounded border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                      >
                        {(project.collections || []).map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.name} ({col.entries?.length || 0} entrées)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#5B5BF0] block mb-1">
                        Champ d&apos;URL (Slug)
                      </label>
                      <select
                        value={selectedDynSlugField}
                        onChange={(e) => setSelectedDynSlugField(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white dark:bg-[#181824] rounded border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                      >
                        <option value="nom">nom (ex: /produit/[nom])</option>
                        <option value="slug">slug (ex: /produit/[slug])</option>
                        <option value="id">id (ex: /produit/[id])</option>
                      </select>
                    </div>

                    <div className="text-[11px] text-[#62627A] dark:text-[#A5A5BC] bg-white dark:bg-[#181824] p-2 rounded border border-[#E6E6EE] dark:border-[#28283C]">
                      Génère la route :{' '}
                      <span className="font-mono font-bold text-[#5B5BF0]">
                        /{((project.collections || []).find((c) => c.id === (selectedDynCollectionId || project.collections?.[0]?.id))?.slug || 'produit').toLowerCase()}/[{selectedDynSlugField}]
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button size="sm" variant="outline" type="button" onClick={() => setIsAddingPage(false)}>
                    Annuler
                  </Button>
                  <Button size="sm" variant="primary" type="submit">
                    {isDynamicMode ? 'Générer le modèle' : 'Créer la page'}
                  </Button>
                </div>
              </form>
            )}

            {/* Liste des pages */}
            <div className="space-y-2">
              {project.pages.map((pg, index) => {
                const isActive = pg.id === activePageId;
                const isHome = pg.isHome || (!project.pages.some((p) => p.isHome) && index === 0);

                return (
                  <div
                    key={pg.id}
                    onClick={() => setActivePageId(pg.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#5B5BF0] bg-[#EEF0FE]/50 dark:bg-[#202038] text-[#5B5BF0] dark:text-[#6B6BF7]'
                        : 'border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#1A1A28] text-[#1B1B2F] dark:text-[#F4F4F9] hover:bg-[#F7F7FA] dark:hover:bg-[#202030]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isHome ? (
                        <Home className="w-4 h-4 shrink-0 text-amber-500" />
                      ) : pg.isDynamic ? (
                        <Database className="w-4 h-4 shrink-0 text-[#5B5BF0]" />
                      ) : (
                        <Files className="w-4 h-4 shrink-0 text-[#8E8EA6]" />
                      )}

                      {editingPageId === pg.id ? (
                        <input
                          type="text"
                          value={editingPageName}
                          onChange={(e) => setEditingPageName(e.target.value)}
                          onBlur={() => handleSavePageRename(pg.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSavePageRename(pg.id);
                            if (e.key === 'Escape') setEditingPageId(null);
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          className="px-1.5 py-0.5 text-xs bg-white dark:bg-[#181824] border border-[#5B5BF0] rounded text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                        />
                      ) : (
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold truncate">{pg.name}</span>
                            {isHome && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                Accueil
                              </span>
                            )}
                            {pg.isDynamic && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#5B5BF0]/15 text-[#5B5BF0] dark:bg-[#5B5BF0]/25 dark:text-[#9A9AFF]">
                                CMS
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#8E8EA6] dark:text-[#75758E] truncate font-mono">
                            /{pg.slug}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions de page */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isHome && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHomePage(pg.id);
                          }}
                          title="Définir comme page d'accueil"
                          className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-amber-500"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          movePageOrder(pg.id, 'up');
                        }}
                        title="Monter l'ordre"
                        className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[#62627A] dark:text-[#A5A5BC]"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          movePageOrder(pg.id, 'down');
                        }}
                        title="Descendre l'ordre"
                        className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[#62627A] dark:text-[#A5A5BC]"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPageId(pg.id);
                          setEditingPageName(pg.name);
                        }}
                        title="Renommer la page"
                        className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[#62627A] dark:text-[#A5A5BC]"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicatePage(pg.id);
                        }}
                        title="Dupliquer la page"
                        className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[#62627A] dark:text-[#A5A5BC]"
                      >
                        <Copy className="w-3 h-3" />
                      </button>

                      {project.pages.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePage(pg.id);
                          }}
                          title="Supprimer la page"
                          className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-950 text-[#EF4444]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= ONGLET 6 : IMAGES ================= */}
        {activeLeftTab === 'media' && (
          <div className="space-y-4">
            {/* Ajout par URL */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#F7F7FA] dark:bg-[#202030] border border-[#E6E6EE] dark:border-[#28283C]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA6] dark:text-[#75758E]">
                Insérer une image par URL
              </span>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-[#181824] rounded-lg border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                />
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    if (customImageUrl.trim()) {
                      const imgEl: Element = {
                        id: `img-${Date.now()}`,
                        type: 'image',
                        props: { src: customImageUrl.trim(), alt: 'Image' },
                        style: {
                          desktop: { width: '100%', maxHeight: '360px', objectFit: 'cover', borderRadius: '12px' },
                          tablet: {},
                          mobile: {},
                        },
                        children: [],
                        bindings: {},
                        locked: false,
                        hidden: false,
                      };
                      insertElementToActivePage(imgEl);
                      setCustomImageUrl('');
                    }
                  }}
                >
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Galerie stock */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA6] dark:text-[#75758E] px-1">
                Photos libres de droits
              </span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {STOCK_PHOTOS.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => {
                      const imgEl: Element = {
                        id: `img-${Date.now()}`,
                        type: 'image',
                        props: { src: photo.url, alt: photo.title },
                        style: {
                          desktop: { width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '12px' },
                          tablet: {},
                          mobile: {},
                        },
                        children: [],
                        bindings: {},
                        locked: false,
                        hidden: false,
                      };
                      insertElementToActivePage(imgEl);
                    }}
                    className="group relative aspect-video rounded-xl overflow-hidden border border-[#E6E6EE] dark:border-[#28283C] cursor-pointer hover:border-[#5B5BF0] shadow-2xs hover:shadow-md transition-all"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                      <span className="text-[10px] text-white font-medium line-clamp-1">
                        {photo.title}
                      </span>
                      <span className="text-[9px] text-[#14B8A6] font-semibold">
                        + Cliquer pour insérer
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// Élément récursif pour l'arborescence des calques avec renommage
interface LayerTreeItemProps {
  element: Element;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onLock: (id: string) => void;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
}

function LayerTreeItem({
  element,
  depth,
  selectedId,
  onSelect,
  onLock,
  onHide,
  onDelete,
  onRename,
  onMove,
}: LayerTreeItemProps) {
  const [expanded, setExpanded] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [customName, setCustomName] = React.useState(element.customName || '');

  const isSelected = selectedId === element.id;
  const hasChildren = element.children && element.children.length > 0;

  const getLabel = () => {
    if (element.customName) return element.customName;
    if (element.props?.text) return `"${element.props.text.slice(0, 16)}..."`;
    if (element.props?.label) return `"${element.props.label.slice(0, 16)}"`;
    return element.type;
  };

  const handleSaveRename = () => {
    onRename(element.id, customName);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col">
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect(element.id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        style={{ paddingLeft: `${depth * 14 + 6}px` }}
        className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs cursor-pointer transition-all ${
          isSelected
            ? 'bg-[#5B5BF0] text-white font-semibold'
            : 'text-[#1B1B2F] dark:text-[#F4F4F9] hover:bg-[#F1F1F6] dark:hover:bg-[#222232]'
        } ${element.hidden ? 'opacity-40 line-through' : ''}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
            >
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          ) : (
            <span className="w-3 h-3 inline-block" />
          )}

          {isEditing ? (
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onBlur={handleSaveRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              className="px-1 py-0.2 text-xs bg-white text-[#1B1B2F] rounded outline-none w-28"
            />
          ) : (
            <span className="truncate">{getLabel()}</span>
          )}
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {depth > 0 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(element.id, 'up');
                }}
                className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                title="Monter"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(element.id, 'down');
                }}
                className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                title="Descendre"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLock(element.id);
            }}
            className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
            title={element.locked ? 'Déverrouiller' : 'Verrouiller'}
          >
            {element.locked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3 opacity-60" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onHide(element.id);
            }}
            className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
            title={element.hidden ? 'Afficher' : 'Masquer'}
          >
            {element.hidden ? <EyeOff className="w-3 h-3 text-red-500" /> : <Eye className="w-3 h-3 opacity-60" />}
          </button>

          {depth > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(element.id);
              }}
              className="p-0.5 rounded hover:bg-red-500 hover:text-white text-red-400"
              title="Supprimer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="flex flex-col">
          {element.children.map((child: Element) => (
            <LayerTreeItem
              key={child.id}
              element={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onLock={onLock}
              onHide={onHide}
              onDelete={onDelete}
              onRename={onRename}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
