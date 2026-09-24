'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/src/core/store';
import { EditorLeftPanel } from '@/src/features/editor/EditorLeftPanel';
import { EditorPropertiesPanel } from '@/src/features/editor/EditorPropertiesPanel';
import { ElementRenderer } from '@/src/features/editor/ElementRenderer';
import { DebugBar } from '@/src/features/logic/DebugBar';

const PreviewModal = dynamic(() => import('@/src/features/editor/PreviewModal').then((mod) => mod.PreviewModal), {
  ssr: false,
});
const PublishModal = dynamic(() => import('@/src/features/editor/PublishModal').then((mod) => mod.PublishModal), {
  ssr: false,
});
const LogicEditorCanvas = dynamic(() => import('@/src/features/logic/LogicEditorCanvas').then((mod) => mod.LogicEditorCanvas), {
  ssr: false,
});
const CodeViewerModal = dynamic(() => import('@/src/features/codeViewer/CodeViewerModal').then((mod) => mod.CodeViewerModal), {
  ssr: false,
});
const SeoSettingsModal = dynamic(() => import('@/src/features/export/SeoSettingsModal').then((mod) => mod.SeoSettingsModal), {
  ssr: false,
});
const IntegrationsModal = dynamic(() => import('@/src/features/integrations/IntegrationsModal').then((mod) => mod.IntegrationsModal), {
  ssr: false,
});

import {
  Smartphone,
  Tablet,
  Monitor,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Eye,
  Download,
  Database,
  Code2,
  Sparkles,
  Layers,
  ChevronDown,
  Globe,
  CheckCircle2,
  Moon,
  Sun,
  Plus,
  SlidersHorizontal,
  AppWindow,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/src/shared/ui';

export default function AtelierApp() {
  const {
    project,
    activePageId,
    setActivePageId,
    editorTab,
    setEditorTab,
    viewportMode,
    setViewportMode,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    undo,
    redo,
    undoStack,
    redoStack,
    theme,
    toggleTheme,
    toasts,
    removeToast,
    selectElement,
    loadProjects,
    setPreviewModalOpen,
    setPublishModalOpen,
    addPage,
  } = useAppStore();

  const [isCodeViewerOpen, setIsCodeViewerOpen] = React.useState(false);
  const [isSeoOpen, setIsSeoOpen] = React.useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = React.useState(false);
  const [isPageDropdownOpen, setIsPageDropdownOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Initialisation du store au chargement
  React.useEffect(() => {
    setMounted(true);
    loadProjects();
  }, [loadProjects]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-slate-50 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Chargement de l'Atelier Studio...</span>
        </div>
      </div>
    );
  }

  const activePage = project.pages.find((p) => p.id === activePageId) || project.pages[0];

  // Gestion du clic droit / menu contextuel
  const handleContextMenu = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    selectElement(elementId);
  };

  // Dimensions et framing selon le mode d'affichage
  const getCanvasDimensions = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'w-[375px] min-h-[667px] shadow-2xl rounded-3xl border-8 border-slate-800 dark:border-slate-700 ring-1 ring-black/10';
      case 'tablet':
        return 'w-[768px] min-h-[1024px] shadow-2xl rounded-2xl border-6 border-slate-800 dark:border-slate-700 ring-1 ring-black/10';
      default:
        return 'w-full max-w-[1280px] min-h-[820px] shadow-xl rounded-xl border border-slate-200/80 dark:border-slate-800/80';
    }
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans`}>
      {/* 1. BARRE DE NAVIGATION SUPÉRIEURE (HEADER PRO STUDIO) */}
      <header className="h-13 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0 z-30 select-none shadow-2xs">
        {/* Zone Gauche : Marque & Sélecteur de Page */}
        <div className="flex items-center gap-3">
          {/* Logo & Wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              <AppWindow className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                Atelier
              </span>
              <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-800/60">
                Studio No-Code
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Sélecteur rapide de page */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="truncate max-w-[120px] font-semibold">{activePage?.name || 'Accueil'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isPageDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsPageDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-1 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Pages du projet
                  </div>
                  {project.pages.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setActivePageId(p.id);
                        setIsPageDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        p.id === activePageId
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      {p.isHome && <span className="text-[10px] text-amber-500">★</span>}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        addPage(`Page ${project.pages.length + 1}`);
                        setIsPageDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter une page</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Onglets principaux du mode de travail */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setEditorTab('design')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                editorTab === 'design'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Design & Balises</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorTab('logic')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                editorTab === 'logic'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Logique Visuelle</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorTab('data')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                editorTab === 'data'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Données CMS</span>
            </button>
          </div>
        </div>

        {/* Zone Centre : Viewport Switcher & Undo/Redo & Zoom */}
        {editorTab === 'design' && (
          <div className="flex items-center gap-3">
            {/* Viewport Modes */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setViewportMode('desktop')}
                title="Ordinateur (>1024px)"
                className={`p-1.5 rounded-md transition-all ${
                  viewportMode === 'desktop'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('tablet')}
                title="Tablette (768px - 1024px)"
                className={`p-1.5 rounded-md transition-all ${
                  viewportMode === 'tablet'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('mobile')}
                title="Mobile (<768px)"
                className={`p-1.5 rounded-md transition-all ${
                  viewportMode === 'mobile'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={undo}
                disabled={undoStack.length === 0}
                title="Annuler (Ctrl+Z)"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={redoStack.length === 0}
                title="Rétablir (Ctrl+Y)"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
              <button
                type="button"
                onClick={zoomOut}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-0.5"
                title="Dézoomer"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="font-mono font-semibold text-[11px] w-9 text-center tabular-nums text-slate-700 dark:text-slate-300">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-0.5"
                title="Zoomer"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-[10px] ml-0.5"
                title="Réinitialiser le zoom"
              >
                100%
              </button>
            </div>
          </div>
        )}

        {/* Zone Droite : Outils, Code, SEO, Thème & Publication */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCodeViewerOpen(true)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-1.5 transition-colors"
            title="Inspecter le code HTML / JS généré"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Code</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSeoOpen(true)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-1.5 transition-colors"
            title="Configuration SEO & Balises Méta"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">SEO</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Basculer thème clair/sombre"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewModalOpen(true)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Aperçu
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setPublishModalOpen(true)}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Exporter ZIP
          </Button>
        </div>
      </header>

      {/* 2. ESPACE DE TRAVAIL PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden">
        {editorTab === 'design' && (
          <>
            {/* Panneau Gauche : Bibliothèque de Balises HTML, Modèles, Thèmes, Pages */}
            <EditorLeftPanel />

            {/* Zone Centrale : Canevas Visuel Studio */}
            <main
              className="flex-1 canvas-grid-bg overflow-auto flex items-start justify-center p-8 relative select-none"
              onClick={() => selectElement(null)}
            >
              {/* Entête décoratif de viewport */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-200/80 dark:border-slate-800/80 text-[11px] font-medium text-slate-500 dark:text-slate-400 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span className="capitalize">{viewportMode}</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="font-mono tabular-nums">
                  {viewportMode === 'mobile' ? '375 × 667px' : viewportMode === 'tablet' ? '768 × 1024px' : '1280 × 820px'}
                </span>
              </div>

              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className={`bg-white dark:bg-slate-900 transition-all relative mt-6 ${getCanvasDimensions()}`}
              >
                {activePage?.root ? (
                  <ElementRenderer
                    element={activePage.root}
                    onContextMenu={handleContextMenu}
                  />
                ) : (
                  <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-3">
                    <Layers className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Page vierge</p>
                      <p className="text-slate-400 mt-1">Glissez une section ou un conteneur depuis le panneau de gauche.</p>
                    </div>
                  </div>
                )}
              </div>
            </main>

            {/* Panneau Droit : Inspecteur de Propriétés & Balises HTML */}
            <EditorPropertiesPanel />
          </>
        )}

        {editorTab === 'logic' && (
          <div className="flex-1 flex flex-col h-full bg-slate-950 relative">
            <LogicEditorCanvas />
            <DebugBar />
          </div>
        )}

        {editorTab === 'data' && (
          <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Gestionnaire de Données CMS & Collections
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Créez des collections dynamiques (articles, produits, équipe, avis) et liez-les à vos balises HTML.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(project.collections || []).map((col) => (
                  <div
                    key={col.id}
                    className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {col.name}
                          </h3>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {col.entries?.length || 0} entrées enregistrées
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] font-medium text-slate-500">Champs de données :</div>
                      <div className="flex flex-wrap gap-1.5">
                        {col.fields.map((f) => (
                          <span
                            key={f.id}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 border border-slate-200/60 dark:border-slate-700/60"
                          >
                            {f.name} <span className="text-slate-400">({f.type})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MODALES COMPLÉMENTAIRES */}
      <PreviewModal />
      <PublishModal />
      <CodeViewerModal isOpen={isCodeViewerOpen} onClose={() => setIsCodeViewerOpen(false)} />
      <SeoSettingsModal isOpen={isSeoOpen} onClose={() => setIsSeoOpen(false)} />
      <IntegrationsModal />

      {/* 4. TOASTS DE NOTIFICATION */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {(toasts || []).map((toast) => (
          <div
            key={toast.id}
            className="p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-2xl flex items-center gap-3 text-xs pointer-events-auto border border-slate-700/60 animate-in slide-in-from-bottom-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold">{toast.title}</p>
              {toast.message && <p className="text-[11px] text-slate-300">{toast.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => removeToast?.(toast.id)}
              className="text-slate-400 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
