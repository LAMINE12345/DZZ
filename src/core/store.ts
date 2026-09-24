import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  Project,
  Page,
  ProjectTheme,
  ToastItem,
  ViewportMode,
  Element,
  Collection,
  CollectionField,
  CollectionFieldType,
  MediaAsset,
  IntegrationConfig,
  I18nConfig,
} from './types';
import { ProjectSchema } from './schema';
import { TEMPLATES } from './templates';
import { THEME_PRESETS } from './themePresets';
import {
  getAllProjectsDB,
  getProjectDB,
  saveProjectDB,
  deleteProjectDB,
  seedInitialDataIfEmpty,
  setActiveProjectIdDB,
} from './db';
import {
  findElementInTree,
  removeElementFromTree,
  insertElementIntoTree,
  reorderElementInTree as reorderTreeFn,
  cloneElementWithNewIds,
} from './elementTreeUtils';
import { t } from '@/src/i18n';

export interface DropIndicator {
  targetParentId: string;
  index: number;
  position: 'inside' | 'before' | 'after';
}

export interface AppState {
  // Navigation & Vues principales
  currentView: 'dashboard' | 'editor' | 'styleguide';
  setCurrentView: (view: 'dashboard' | 'editor' | 'styleguide') => void;

  // Thème clair/sombre de l'interface Atelier
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Liste de projets & Persistance
  projects: Project[];
  isLoadingProjects: boolean;
  isSaving: boolean;
  loadProjects: () => Promise<void>;
  createProjectFromTemplate: (templateId: string, customName?: string) => Promise<Project>;
  openProject: (projectId: string) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<Project | null>;
  renameProject: (projectId: string, newName: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  exportProjectAsFile: (projectId?: string) => void;
  importProjectFromFile: (fileContent: string) => Promise<Project | null>;
  saveCurrentProject: () => Promise<void>;

  // Projet Actif
  project: Project;
  setProject: (project: Project) => void;
  updateProjectName: (name: string) => void;
  setIsSaving: (saving: boolean) => void;

  // Thème Global du Projet Actif (Marque, Polices, Boutons)
  updateProjectTheme: (themeUpdate: Partial<ProjectTheme>) => void;
  applyThemePreset: (presetId: string) => void;

  // Éditeur - Navigation & Modes
  editorTab: 'design' | 'logic' | 'data';
  setEditorTab: (tab: 'design' | 'logic' | 'data') => void;
  activeLeftTab: 'elements' | 'templates' | 'theme' | 'layers' | 'pages' | 'media';
  setActiveLeftTab: (tab: 'elements' | 'templates' | 'theme' | 'layers' | 'pages' | 'media') => void;
  activePageId: string;
  setActivePageId: (id: string) => void;
  viewportMode: ViewportMode;
  setViewportMode: (mode: ViewportMode) => void;

  // Éditeur - Zoom & Pan (Navigation Canvas)
  zoom: number;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number }) => void;
  resetPan: () => void;

  // Éditeur - Sélection & Multi-sélection
  selectedElementId: string | null;
  selectedElementIds: string[];
  selectElement: (id: string | null, multi?: boolean) => void;
  clearSelection: () => void;

  // Éditeur - Édition de texte en ligne
  inlineEditingId: string | null;
  setInlineEditingId: (id: string | null) => void;

  // Éditeur - Glisser-Déposer & Indicateur
  draggedElementType: string | null;
  setDraggedElementType: (type: string | null) => void;
  dropIndicator: DropIndicator | null;
  setDropIndicator: (ind: DropIndicator | null) => void;

  // Éditeur - Historique Annuler / Rétablir (Undo / Redo)
  undoStack: Project[];
  redoStack: Project[];
  pushSnapshot: () => void;
  undo: () => void;
  redo: () => void;

  // Éditeur - Presse-papier & Opérations sur les éléments
  clipboard: Element | null;
  copyElement: (elementId?: string) => void;
  cutElement: (elementId?: string) => void;
  pasteElement: (targetParentId?: string) => void;
  duplicateElement: (elementId: string) => void;
  deleteElement: (elementId: string) => void;
  lockElement: (elementId: string, locked?: boolean) => void;
  hideElement: (elementId: string, hidden?: boolean) => void;
  renameElement: (elementId: string, customName: string) => void;
  updateElementProps: (elementId: string, props: Record<string, any>) => void;
  updateElementStyle: (elementId: string, style: Record<string, any>, breakpoint?: ViewportMode) => void;
  removeElementStyleProperty: (elementId: string, propertyKey: string, breakpoint: ViewportMode) => void;
  resetElementBreakpointStyle: (elementId: string, breakpoint: ViewportMode) => void;
  moveElementOrder: (elementId: string, direction: 'up' | 'down') => void;
  reorderElementInTree: (sourceId: string, targetParentId: string, targetIndex?: number) => void;
  insertElementToActivePage: (element: Element, targetParentId?: string, index?: number) => void;

  // Liaisons de Données (Data Binding)
  bindElementProp: (elementId: string, propKey: string, bindingExpression: string) => void;
  unbindElementProp: (elementId: string, propKey: string) => void;

  // Gestion des Collections (CMS / Données)
  activeCollectionId: string | null;
  setActiveCollectionId: (id: string | null) => void;
  createCollection: (name: string, slug?: string, description?: string) => Collection;
  updateCollection: (collectionId: string, update: Partial<Collection>) => void;
  deleteCollection: (collectionId: string) => void;
  addFieldToCollection: (collectionId: string, field: Omit<CollectionField, 'id'>) => void;
  updateFieldInCollection: (collectionId: string, fieldId: string, update: Partial<CollectionField>) => void;
  deleteFieldFromCollection: (collectionId: string, fieldId: string) => void;
  addEntryToCollection: (collectionId: string, entry: Record<string, any>) => void;
  updateEntryInCollection: (collectionId: string, entryId: string, data: Record<string, any>) => void;
  duplicateEntryInCollection: (collectionId: string, entryId: string) => void;
  deleteEntryFromCollection: (collectionId: string, entryId: string) => void;
  importEntriesFromCSV: (collectionId: string, entries: Record<string, any>[]) => void;

  // Médiathèque d'images
  addMediaAsset: (asset: Omit<MediaAsset, 'id' | 'createdAt'>) => MediaAsset;
  updateMediaAsset: (id: string, update: Partial<MediaAsset>) => void;
  deleteMediaAsset: (id: string) => void;

  // Gestion des Pages
  addPage: (name?: string, isDynamic?: boolean, dynamicCollectionId?: string) => void;
  addDynamicPage: (name?: string, collectionId?: string, slugField?: string) => void;
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  renamePage: (pageId: string, newName: string, newSlug?: string) => void;
  updatePage: (pageId: string, update: Partial<Page>) => void;
  setHomePage: (pageId: string) => void;
  setPageDynamic: (pageId: string, isDynamic: boolean, collectionId?: string, slugField?: string) => void;
  movePageOrder: (pageId: string, direction: 'up' | 'down') => void;
  reorderPages: (sourceIndex: number, targetIndex: number) => void;

  // Toasts / Notifications
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;

  // Comportement & Logique
  addBehaviorForElement: (elementId: string) => void;

  // Modales
  isPreviewModalOpen: boolean;
  setPreviewModalOpen: (open: boolean) => void;
  isPublishModalOpen: boolean;
  setPublishModalOpen: (open: boolean) => void;
  isHelpModalOpen: boolean;
  setHelpModalOpen: (open: boolean) => void;

  // Integrations & i18n
  isIntegrationsModalOpen: boolean;
  setIntegrationsModalOpen: (open: boolean) => void;
  updateIntegrations: (update: Partial<IntegrationConfig>) => void;

  isI18nModalOpen: boolean;
  setI18nModalOpen: (open: boolean) => void;
  updateI18n: (update: Partial<I18nConfig>) => void;
  setI18nActiveLocale: (locale: string) => void;

  // Étape 8 : Débutant, Onboarding & Assistance
  experienceMode: 'simple' | 'advanced';
  setExperienceMode: (mode: 'simple' | 'advanced') => void;
  toggleExperienceMode: () => void;

  isWelcomeWizardOpen: boolean;
  setWelcomeWizardOpen: (open: boolean) => void;

  isTourActive: boolean;
  setTourActive: (active: boolean) => void;

  isAiAssistantOpen: boolean;
  setAiAssistantOpen: (open: boolean) => void;

  isVersionHistoryOpen: boolean;
  setVersionHistoryOpen: (open: boolean) => void;

  lastSavedTime: string | null;
  versionHistory: Array<{ id: string; projectId: string; timestamp: string; label: string; project: any }>;
  saveVersionSnapshot: (label?: string) => void;
  restoreVersion: (versionId: string) => void;

  completedMissions: Record<string, boolean>;
  toggleMissionTask: (taskId: string) => void;
  resetMissions: () => void;
}

import { DEFAULT_PRODUCTS_COLLECTION, DEFAULT_ARTICLES_COLLECTION, DEFAULT_MEDIA_ASSETS } from './defaultCmsData';

const fallbackTemplate = TEMPLATES[0];
const baseTemplateProject = fallbackTemplate.createProject ? fallbackTemplate.createProject() : (fallbackTemplate as any).project || {};
const defaultInitialProject: Project = {
  ...baseTemplateProject,
  id: 'proj-default',
  name: 'Mon Premier Projet',
  description: 'Un site web moderne et accessible créé avec Atelier.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  collections: [DEFAULT_PRODUCTS_COLLECTION, DEFAULT_ARTICLES_COLLECTION],
  media: DEFAULT_MEDIA_ASSETS,
  theme: {
    primaryColor: '#5B5BF0',
    accentColor: '#14B8A6',
    backgroundColor: '#F7F7FA',
    surfaceColor: '#FFFFFF',
    textColor: '#1B1B2F',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    radius: 12,
    buttonStyle: 'filled',
    buttonRadius: 12,
    buttonShadow: 'sm',
  },
};

let autoSaveTimer: NodeJS.Timeout | null = null;
const MAX_HISTORY = 50;

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    // Navigation
    currentView: 'dashboard',
    setCurrentView: (view) =>
      set((state) => {
        state.currentView = view;
      }),

    // Thème d'interface
    theme: 'light',
    setTheme: (theme) =>
      set((state) => {
        state.theme = theme;
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }),
    toggleTheme: () =>
      set((state) => {
        const nextTheme = state.theme === 'light' ? 'dark' : 'light';
        state.theme = nextTheme;
        if (typeof document !== 'undefined') {
          if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }),

    // Liste de projets & DB
    projects: [],
    isLoadingProjects: false,
    isSaving: false,
    project: defaultInitialProject,

    loadProjects: async () => {
      set((state) => {
        state.isLoadingProjects = true;
      });
      try {
        const loadedProjects = await seedInitialDataIfEmpty();
        set((state) => {
          state.projects = loadedProjects;
          if (loadedProjects.length > 0) {
            state.project = loadedProjects[0];
            const homePage = loadedProjects[0].pages.find((p) => p.isHome) || loadedProjects[0].pages[0];
            state.activePageId = homePage?.id || 'page-home';
          }
          state.isLoadingProjects = false;
        });
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        set((state) => {
          state.isLoadingProjects = false;
        });
      }
    },

    createProjectFromTemplate: async (templateId: string, customName?: string) => {
      const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
      const now = new Date().toISOString();
      const newProjName = customName?.trim() || t(template.nameKey, template.project.name);

      const newProj: Project = {
        ...template.project,
        id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: newProjName,
        createdAt: now,
        updatedAt: now,
        theme: template.project.theme || defaultInitialProject.theme,
      };

      try {
        await saveProjectDB(newProj);
        await setActiveProjectIdDB(newProj.id);
        const all = await getAllProjectsDB();
        set((state) => {
          state.projects = all;
          state.project = newProj;
          const homePage = newProj.pages.find((p) => p.isHome) || newProj.pages[0];
          state.activePageId = homePage?.id || 'page-home';
          state.undoStack = [];
          state.redoStack = [];
          state.selectedElementId = null;
          state.selectedElementIds = [];
          state.currentView = 'editor';
        });
        get().addToast({
          type: 'success',
          title: t('dashboard.toasts.created', 'Projet créé avec succès !'),
          message: `${newProj.name} est prêt dans l'Atelier.`,
        });
        return newProj;
      } catch (error) {
        console.error('Erreur création projet:', error);
        get().addToast({
          type: 'error',
          title: 'Erreur de création',
          message: 'Impossible de créer le projet.',
        });
        throw error;
      }
    },

    openProject: async (projectId: string) => {
      const target = get().projects.find((p) => p.id === projectId) || (await getProjectDB(projectId));
      if (target) {
        await setActiveProjectIdDB(target.id);
        set((state) => {
          state.project = target;
          const homePage = target.pages.find((p) => p.isHome) || target.pages[0];
          state.activePageId = homePage?.id || 'page-home';
          state.undoStack = [];
          state.redoStack = [];
          state.selectedElementId = null;
          state.selectedElementIds = [];
          state.currentView = 'editor';
        });
        get().addToast({
          type: 'info',
          title: target.name,
          message: 'Projet chargé dans votre Atelier.',
        });
      }
    },

    duplicateProject: async (projectId: string) => {
      const target = get().projects.find((p) => p.id === projectId) || (await getProjectDB(projectId));
      if (!target) return null;

      const now = new Date().toISOString();
      const duplicated: Project = {
        ...JSON.parse(JSON.stringify(target)),
        id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `${target.name} (Copie)`,
        createdAt: now,
        updatedAt: now,
      };

      try {
        await saveProjectDB(duplicated);
        const all = await getAllProjectsDB();
        set((state) => {
          state.projects = all;
        });
        get().addToast({
          type: 'success',
          title: t('dashboard.toasts.duplicated', 'Projet dupliqué avec succès !'),
          message: `Une copie de "${target.name}" a été créée.`,
        });
        return duplicated;
      } catch (err) {
        console.error('Erreur duplication:', err);
        return null;
      }
    },

    renameProject: async (projectId: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;

      const currentList = get().projects;
      const targetIndex = currentList.findIndex((p) => p.id === projectId);
      if (targetIndex === -1) return;

      const updated = {
        ...currentList[targetIndex],
        name: trimmed,
        updatedAt: new Date().toISOString(),
      };

      await saveProjectDB(updated);
      set((state) => {
        state.projects[targetIndex] = updated;
        if (state.project.id === projectId) {
          state.project.name = trimmed;
          state.project.updatedAt = updated.updatedAt;
        }
      });

      get().addToast({
        type: 'success',
        title: t('dashboard.toasts.renamed', 'Projet renommé avec succès !'),
        message: `Le nouveau nom est : ${trimmed}`,
      });
    },

    deleteProject: async (projectId: string) => {
      try {
        await deleteProjectDB(projectId);
        const all = await getAllProjectsDB();
        set((state) => {
          state.projects = all;
          if (state.project.id === projectId) {
            if (all.length > 0) {
              state.project = all[0];
              const homePage = all[0].pages.find((p) => p.isHome) || all[0].pages[0];
              state.activePageId = homePage?.id || 'page-home';
            } else {
              state.project = defaultInitialProject;
            }
          }
        });
        get().addToast({
          type: 'info',
          title: t('dashboard.toasts.deleted', 'Projet supprimé.'),
          message: 'Le projet a été retiré de votre espace.',
        });
      } catch (err) {
        console.error('Erreur suppression:', err);
      }
    },

    exportProjectAsFile: (projectId?: string) => {
      const target = projectId
        ? get().projects.find((p) => p.id === projectId) || get().project
        : get().project;

      if (!target) return;

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(target, null, 2));
      const downloadAnchor = document.createElement('a');
      const safeFilename = `${target.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'projet'}.atelier.json`;
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', safeFilename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      get().addToast({
        type: 'success',
        title: t('dashboard.toasts.exported', 'Fichier .atelier.json téléchargé !'),
        message: `Fichier sauvegardé sous le nom ${safeFilename}`,
      });
    },

    importProjectFromFile: async (fileContent: string) => {
      try {
        const rawJson = JSON.parse(fileContent);
        const parsed = ProjectSchema.parse(rawJson);
        const now = new Date().toISOString();
        const importedProject: Project = {
          ...parsed,
          id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: `${parsed.name} (Importé)`,
          createdAt: parsed.createdAt || now,
          updatedAt: now,
        };

        await saveProjectDB(importedProject);
        const all = await getAllProjectsDB();
        set((state) => {
          state.projects = all;
          state.project = importedProject;
          const homePage = importedProject.pages.find((p) => p.isHome) || importedProject.pages[0];
          state.activePageId = homePage?.id || 'page-home';
          state.undoStack = [];
          state.redoStack = [];
          state.currentView = 'editor';
        });

        get().addToast({
          type: 'success',
          title: t('dashboard.toasts.imported', 'Projet importé et prêt à l’emploi !'),
          message: `${importedProject.name} est ouvert dans l'Atelier.`,
        });
        return importedProject;
      } catch (error) {
        console.error('Erreur validation import:', error);
        get().addToast({
          type: 'error',
          title: 'Format de fichier non reconnu',
          message: t('dashboard.toasts.importError', 'Le fichier importé n’est pas un projet Atelier valide.'),
        });
        return null;
      }
    },

    saveCurrentProject: async () => {
      const current = get().project;
      const nowIso = new Date().toISOString();
      set((state) => {
        state.isSaving = true;
      });
      try {
        const updated = {
          ...current,
          updatedAt: nowIso,
        };
        await saveProjectDB(updated);
        const all = await getAllProjectsDB();
        set((state) => {
          state.project = updated;
          state.projects = all;
          state.isSaving = false;
          state.lastSavedTime = nowIso;
        });

        // Ajouter une entrée d'historique de version toutes les quelques modifications
        const versions = get().versionHistory;
        const lastVersion = versions[0];
        const isTimeElapsed = !lastVersion || Date.now() - new Date(lastVersion.timestamp).getTime() > 15000;
        if (isTimeElapsed) {
          get().saveVersionSnapshot();
        }
      } catch (err) {
        console.error('Erreur sauvegarde:', err);
        set((state) => {
          state.isSaving = false;
        });
      }
    },

    setProject: (project) => {
      set((state) => {
        state.project = project;
      });
    },

    updateProjectName: (name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      get().pushSnapshot();
      set((state) => {
        state.project.name = trimmed;
      });
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    setIsSaving: (saving) =>
      set((state) => {
        state.isSaving = saving;
      }),

    // Thème Global du Projet
    updateProjectTheme: (themeUpdate) => {
      get().pushSnapshot();
      set((state) => {
        const currentTheme = state.project.theme || {
          primaryColor: '#000000',
          accentColor: '#FF2D20',
          backgroundColor: '#F8F8F9',
          surfaceColor: '#FFFFFF',
          textColor: '#121214',
          headingFont: 'Plus Jakarta Sans',
          bodyFont: 'Inter',
          radius: 2,
          buttonStyle: 'filled',
          buttonRadius: 2,
          buttonShadow: 'none',
        };
        state.project.theme = {
          ...currentTheme,
          ...themeUpdate,
        };
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    applyThemePreset: (presetId) => {
      const preset = THEME_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      get().pushSnapshot();
      set((state) => {
        state.project.theme = {
          ...state.project.theme,
          ...(preset.theme || {}),
        };
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);

      get().addToast({
        type: 'success',
        title: 'Thème appliqué',
        message: `Le thème « ${preset.name} » a mis à jour l'ensemble du projet.`,
      });
    },

    // Éditeur Tabs & Navigation
    editorTab: 'design',
    setEditorTab: (tab) =>
      set((state) => {
        state.editorTab = tab;
      }),
    activeLeftTab: 'elements',
    setActiveLeftTab: (tab) =>
      set((state) => {
        state.activeLeftTab = tab;
      }),
    activePageId: 'page-home',
    setActivePageId: (id) =>
      set((state) => {
        state.activePageId = id;
        state.selectedElementId = null;
        state.selectedElementIds = [];
      }),
    viewportMode: 'desktop',
    setViewportMode: (mode) =>
      set((state) => {
        state.viewportMode = mode;
      }),

    // Zoom & Pan
    zoom: 1.0,
    setZoom: (zoom) =>
      set((state) => {
        state.zoom = Math.max(0.3, Math.min(2.5, zoom));
      }),
    zoomIn: () =>
      set((state) => {
        state.zoom = Math.min(2.5, Number((state.zoom + 0.1).toFixed(2)));
      }),
    zoomOut: () =>
      set((state) => {
        state.zoom = Math.max(0.3, Number((state.zoom - 0.1).toFixed(2)));
      }),
    resetZoom: () =>
      set((state) => {
        state.zoom = 1.0;
        state.pan = { x: 0, y: 0 };
      }),
    pan: { x: 0, y: 0 },
    setPan: (pan) =>
      set((state) => {
        state.pan = pan;
      }),
    resetPan: () =>
      set((state) => {
        state.pan = { x: 0, y: 0 };
      }),

    // Sélection
    selectedElementId: null,
    selectedElementIds: [],
    selectElement: (id, multi = false) =>
      set((state) => {
        if (!id) {
          state.selectedElementId = null;
          state.selectedElementIds = [];
          return;
        }
        if (multi) {
          if (state.selectedElementIds.includes(id)) {
            state.selectedElementIds = state.selectedElementIds.filter((item) => item !== id);
            state.selectedElementId = state.selectedElementIds[0] || null;
          } else {
            state.selectedElementIds.push(id);
            state.selectedElementId = id;
          }
        } else {
          state.selectedElementId = id;
          state.selectedElementIds = [id];
        }
      }),
    clearSelection: () =>
      set((state) => {
        state.selectedElementId = null;
        state.selectedElementIds = [];
        state.inlineEditingId = null;
      }),

    // Inline edit
    inlineEditingId: null,
    setInlineEditingId: (id) =>
      set((state) => {
        state.inlineEditingId = id;
      }),

    // Glisser-déposer
    draggedElementType: null,
    setDraggedElementType: (type) =>
      set((state) => {
        state.draggedElementType = type;
      }),
    dropIndicator: null,
    setDropIndicator: (ind) =>
      set((state) => {
        state.dropIndicator = ind;
      }),

    // Historique Undo / Redo
    undoStack: [],
    redoStack: [],
    pushSnapshot: () =>
      set((state) => {
        const snapshot = JSON.parse(JSON.stringify(state.project));
        state.undoStack.push(snapshot);
        if (state.undoStack.length > MAX_HISTORY) {
          state.undoStack.shift();
        }
        state.redoStack = [];
      }),

    undo: () => {
      const { undoStack, project } = get();
      if (undoStack.length === 0) return;

      const previousSnapshot = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, -1);
      const currentSnapshot = JSON.parse(JSON.stringify(project));

      set((state) => {
        state.project = previousSnapshot;
        state.undoStack = newUndoStack;
        state.redoStack.push(currentSnapshot);
        state.selectedElementId = null;
        state.selectedElementIds = [];
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    redo: () => {
      const { redoStack, project } = get();
      if (redoStack.length === 0) return;

      const nextSnapshot = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, -1);
      const currentSnapshot = JSON.parse(JSON.stringify(project));

      set((state) => {
        state.project = nextSnapshot;
        state.redoStack = newRedoStack;
        state.undoStack.push(currentSnapshot);
        state.selectedElementId = null;
        state.selectedElementIds = [];
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    // Clipboard & Opérations sur les éléments
    clipboard: null,

    copyElement: (elementId) => {
      const targetId = elementId || get().selectedElementId;
      if (!targetId) return;

      const page = get().project.pages.find((p) => p.id === get().activePageId);
      if (!page) return;

      const match = findElementInTree(page.root, targetId);
      if (match) {
        set((state) => {
          state.clipboard = JSON.parse(JSON.stringify(match.element));
        });
        get().addToast({
          type: 'info',
          title: 'Élément copié',
          message: `L'élément a été copié dans le presse-papier.`,
        });
      }
    },

    cutElement: (elementId) => {
      const targetId = elementId || get().selectedElementId;
      if (!targetId) return;

      const page = get().project.pages.find((p) => p.id === get().activePageId);
      if (!page) return;

      if (targetId === page.root.id) {
        get().addToast({
          type: 'warning',
          title: 'Action impossible',
          message: 'Impossible de couper la racine de la page.',
        });
        return;
      }

      const match = findElementInTree(page.root, targetId);
      if (match) {
        get().pushSnapshot();
        const elementToCut = JSON.parse(JSON.stringify(match.element));

        set((state) => {
          state.clipboard = elementToCut;
          const p = state.project.pages.find((pg) => pg.id === get().activePageId);
          if (p) {
            removeElementFromTree(p.root, targetId);
          }
          state.selectedElementId = null;
          state.selectedElementIds = [];
        });

        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
          get().saveCurrentProject();
        }, 800);

        get().addToast({
          type: 'info',
          title: 'Élément coupé',
          message: `L'élément a été coupé et placé dans le presse-papier.`,
        });
      }
    },

    pasteElement: (targetParentId) => {
      const { clipboard, selectedElementId, activePageId } = get();
      if (!clipboard) return;

      const page = get().project.pages.find((p) => p.id === activePageId);
      if (!page) return;

      get().pushSnapshot();

      const newClonedElement = cloneElementWithNewIds(clipboard);
      const parentId = targetParentId || selectedElementId || page.root.id;

      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === activePageId);
        if (p) {
          const inserted = insertElementIntoTree(p.root, parentId, newClonedElement);
          if (!inserted) {
            p.root.children.push(newClonedElement);
          }
        }
        state.selectedElementId = newClonedElement.id;
        state.selectedElementIds = [newClonedElement.id];
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);

      get().addToast({
        type: 'success',
        title: 'Élément collé',
        message: 'L’élément a été inséré.',
      });
    },

    duplicateElement: (elementId) => {
      const page = get().project.pages.find((p) => p.id === get().activePageId);
      if (!page) return;

      const match = findElementInTree(page.root, elementId);
      if (!match) return;

      get().pushSnapshot();

      const duplicated = cloneElementWithNewIds(match.element);
      const targetParentId = match.parent ? match.parent.id : page.root.id;
      const targetIndex = match.parent ? match.index + 1 : undefined;

      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === get().activePageId);
        if (p) {
          insertElementIntoTree(p.root, targetParentId, duplicated, targetIndex);
        }
        state.selectedElementId = duplicated.id;
        state.selectedElementIds = [duplicated.id];
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);

      get().addToast({
        type: 'success',
        title: 'Élément dupliqué',
        message: 'Une copie a été insérée juste à côté.',
      });
    },

    deleteElement: (elementId) => {
      const page = get().project.pages.find((p) => p.id === get().activePageId);
      if (!page) return;

      if (elementId === page.root.id) {
        get().addToast({
          type: 'warning',
          title: 'Action impossible',
          message: 'Impossible de supprimer le conteneur racine de la page.',
        });
        return;
      }

      get().pushSnapshot();

      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === get().activePageId);
        if (p) {
          removeElementFromTree(p.root, elementId);
        }
        if (state.selectedElementId === elementId) {
          state.selectedElementId = null;
          state.selectedElementIds = [];
        }
        state.selectedElementIds = state.selectedElementIds.filter((id) => id !== elementId);
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    lockElement: (elementId, locked) => {
      const page = get().project.pages.find((p) => p.id === get().activePageId);
      if (!page) return;

      get().pushSnapshot();

      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === get().activePageId);
        if (p) {
          const m = findElementInTree(p.root, elementId);
          if (m) {
            m.element.locked = locked !== undefined ? locked : !m.element.locked;
          }
        }
      });
    },

    hideElement: (elementId, hidden) => {
      const page = get().project.pages.find((p) => p.id === get().activePageId);
      if (!page) return;

      get().pushSnapshot();

      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === get().activePageId);
        if (p) {
          const m = findElementInTree(p.root, elementId);
          if (m) {
            m.element.hidden = hidden !== undefined ? hidden : !m.element.hidden;
          }
        }
      });
    },

    renameElement: (elementId, customName) => {
      const trimmed = customName.trim();
      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === get().activePageId);
        if (p) {
          const m = findElementInTree(p.root, elementId);
          if (m) {
            m.element.customName = trimmed || undefined;
          }
        }
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    updateElementProps: (elementId, props) => {
      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === get().activePageId);
        if (p) {
          const m = findElementInTree(p.root, elementId);
          if (m) {
            m.element.props = { ...m.element.props, ...props };
          }
        }
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    updateElementStyle: (elementId, styleObj, breakpoint = 'desktop') => {
      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === get().activePageId);
        if (p) {
          const m = findElementInTree(p.root, elementId);
          if (m) {
            if (!m.element.style) {
              m.element.style = { desktop: {}, tablet: {}, mobile: {} };
            }
            if (!m.element.style[breakpoint]) {
              m.element.style[breakpoint] = {};
            }
            m.element.style[breakpoint] = {
              ...m.element.style[breakpoint],
              ...styleObj,
            };
          }
        }
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    removeElementStyleProperty: (elementId, propertyKey, breakpoint) => {
      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === get().activePageId);
        if (p) {
          const m = findElementInTree(p.root, elementId);
          if (m && m.element.style && m.element.style[breakpoint]) {
            delete m.element.style[breakpoint][propertyKey];
          }
        }
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    resetElementBreakpointStyle: (elementId, breakpoint) => {
      if (breakpoint === 'desktop') return;
      get().pushSnapshot();
      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === get().activePageId);
        if (p) {
          const m = findElementInTree(p.root, elementId);
          if (m && m.element.style) {
            m.element.style[breakpoint] = {};
          }
        }
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);

      get().addToast({
        type: 'info',
        title: 'Héritage rétabli',
        message: `Les styles spécifiques ${breakpoint === 'mobile' ? 'Mobile' : 'Tablette'} ont été réinitialisés pour hériter du bureau.`,
      });
    },

    moveElementOrder: (elementId, direction) => {
      const page = get().project.pages.find((p) => p.id === get().activePageId);
      if (!page) return;

      get().pushSnapshot();

      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === get().activePageId);
        if (p) {
          const m = findElementInTree(p.root, elementId);
          if (m && m.parent) {
            const list = m.parent.children;
            const idx = m.index;
            if (direction === 'up' && idx > 0) {
              const temp = list[idx - 1];
              list[idx - 1] = list[idx];
              list[idx] = temp;
            } else if (direction === 'down' && idx < list.length - 1) {
              const temp = list[idx + 1];
              list[idx + 1] = list[idx];
              list[idx] = temp;
            }
          }
        }
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    reorderElementInTree: (sourceId, targetParentId, targetIndex) => {
      const page = get().project.pages.find((p) => p.id === get().activePageId);
      if (!page) return;

      get().pushSnapshot();

      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === get().activePageId);
        if (p) {
          reorderTreeFn(p.root, sourceId, targetParentId, targetIndex);
        }
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    insertElementToActivePage: (element, targetParentId, index) => {
      const page = get().project.pages.find((p) => p.id === get().activePageId);
      if (!page) return;

      get().pushSnapshot();

      const parentId = targetParentId || get().selectedElementId || page.root.id;

      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === get().activePageId);
        if (p) {
          const inserted = insertElementIntoTree(p.root, parentId, element, index);
          if (!inserted) {
            p.root.children.push(element);
          }
        }
        state.selectedElementId = element.id;
        state.selectedElementIds = [element.id];
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);

      get().addToast({
        type: 'success',
        title: 'Élément ajouté',
        message: `${element.type} inséré sur la page.`,
      });
    },

    // Gestion des Pages
    addPage: (name) => {
      get().pushSnapshot();
      const newPageId = `page-${Date.now()}`;
      const pageCount = get().project.pages.length + 1;
      const pageName = name?.trim() || `Page ${pageCount}`;
      const slug = pageName.toLowerCase().replace(/[^a-z0-9]/g, '-') || `page-${pageCount}`;

      const newPage = {
        id: newPageId,
        name: pageName,
        slug,
        isHome: false,
        isDynamic: false,
        root: {
          id: `root-${Date.now()}`,
          type: 'box',
          props: { direction: 'vertical', gap: 20 },
          style: {
            desktop: { padding: '48px 24px', maxWidth: '1000px', margin: '0 auto', minHeight: '400px' },
            tablet: { padding: '32px 16px' },
            mobile: { padding: '20px 12px' },
          },
          children: [
            {
              id: `h1-${Date.now()}`,
              type: 'heading',
              props: { text: pageName, tag: 'h1' },
              style: { desktop: { fontSize: '32px', fontWeight: '800', color: '#1B1B2F' }, tablet: {}, mobile: {} },
              children: [],
              bindings: {},
              locked: false,
              hidden: false,
            },
          ],
          bindings: {},
          locked: false,
          hidden: false,
        },
        graphs: [],
      };

      set((state) => {
        state.project.pages.push(newPage);
        state.activePageId = newPageId;
        state.selectedElementId = null;
        state.selectedElementIds = [];
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);

      get().addToast({
        type: 'success',
        title: 'Page créée',
        message: `La page « ${pageName} » est prête.`,
      });
    },

    addDynamicPage: (name?: string, collectionId?: string, slugField = 'nom') => {
      get().pushSnapshot();
      const col = collectionId
        ? get().project.collections?.find((c) => c.id === collectionId)
        : get().project.collections?.[0];
      const colName = col?.name || 'Produits';
      const colSlug = (col?.slug || 'produit').toLowerCase();
      const pageName = name?.trim() || `Modèle ${colName}`;
      const newPageId = `page-dyn-${Date.now()}`;

      const dynamicPage = {
        id: newPageId,
        name: pageName,
        slug: `${colSlug}/[${slugField}]`,
        isHome: false,
        isDynamic: true,
        dynamicCollectionId: col?.id || 'col-produits',
        dynamicSlugField: slugField,
        root: {
          id: `root-dyn-${Date.now()}`,
          type: 'box',
          props: { direction: 'vertical', gap: 24 },
          style: {
            desktop: {
              padding: '48px 24px',
              maxWidth: '1100px',
              margin: '0 auto',
              minHeight: '600px',
            },
            tablet: { padding: '32px 16px' },
            mobile: { padding: '20px 12px' },
          },
          children: [
            {
              id: `dyn-bc-${Date.now()}`,
              type: 'button',
              props: { label: `← Retour aux ${colName}`, linkUrl: '/' },
              style: {
                desktop: {
                  backgroundColor: 'transparent',
                  color: '#5B5BF0',
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '6px 0',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                },
                tablet: {},
                mobile: {},
              },
              children: [],
              bindings: {},
              locked: false,
              hidden: false,
            },
            {
              id: `dyn-grid-${Date.now()}`,
              type: 'box',
              props: { layoutMode: 'auto' },
              style: {
                desktop: {
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.2fr',
                  gap: '40px',
                  alignItems: 'start',
                  backgroundColor: '#FFFFFF',
                  padding: '32px',
                  borderRadius: '20px',
                  border: '1px solid #E6E6EE',
                  boxShadow: '0 4px 25px -4px rgba(0,0,0,0.06)',
                },
                tablet: {
                  gridTemplateColumns: '1fr',
                  gap: '24px',
                  padding: '24px',
                },
                mobile: {
                  gridTemplateColumns: '1fr',
                  gap: '20px',
                  padding: '16px',
                },
              },
              children: [
                {
                  id: `dyn-img-${Date.now()}`,
                  type: 'image',
                  props: {
                    src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
                    alt: 'Visuel du produit',
                  },
                  bindings: {
                    src: 'item.image',
                  },
                  style: {
                    desktop: {
                      width: '100%',
                      height: '420px',
                      objectFit: 'cover',
                      borderRadius: '16px',
                    },
                    tablet: { height: '320px' },
                    mobile: { height: '240px' },
                  },
                  children: [],
                  locked: false,
                  hidden: false,
                },
                {
                  id: `dyn-details-${Date.now()}`,
                  type: 'box',
                  props: { layoutMode: 'auto', direction: 'vertical', gap: 16 },
                  style: {
                    desktop: {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                    },
                    tablet: {},
                    mobile: {},
                  },
                  children: [
                    {
                      id: `dyn-cat-${Date.now()}`,
                      type: 'text',
                      props: { text: 'Collection Exclusive' },
                      bindings: { text: 'item.categorie' },
                      style: {
                        desktop: {
                          fontSize: '12px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          color: '#5B5BF0',
                          letterSpacing: '0.08em',
                        },
                        tablet: {},
                        mobile: {},
                      },
                      children: [],
                      locked: false,
                      hidden: false,
                    },
                    {
                      id: `dyn-title-${Date.now()}`,
                      type: 'heading',
                      props: { text: 'Nom du Produit', tag: 'h1' },
                      bindings: { text: 'item.nom' },
                      style: {
                        desktop: {
                          fontSize: '32px',
                          fontWeight: '800',
                          color: '#1B1B2F',
                          lineHeight: '1.2',
                        },
                        tablet: { fontSize: '26px' },
                        mobile: { fontSize: '22px' },
                      },
                      children: [],
                      locked: false,
                      hidden: false,
                    },
                    {
                      id: `dyn-price-${Date.now()}`,
                      type: 'text',
                      props: { text: '99 €' },
                      bindings: { text: 'item.prix' },
                      style: {
                        desktop: {
                          fontSize: '28px',
                          fontWeight: '900',
                          color: '#10B981',
                        },
                        tablet: { fontSize: '24px' },
                        mobile: { fontSize: '20px' },
                      },
                      children: [],
                      locked: false,
                      hidden: false,
                    },
                    {
                      id: `dyn-desc-${Date.now()}`,
                      type: 'text',
                      props: {
                        text: 'Description détaillée du produit et de ses caractéristiques remarquables. Conçu avec des matériaux haut de gamme.',
                      },
                      bindings: { text: 'item.description' },
                      style: {
                        desktop: {
                          fontSize: '14px',
                          color: '#62627A',
                          lineHeight: '1.7',
                        },
                        tablet: {},
                        mobile: {},
                      },
                      children: [],
                      locked: false,
                      hidden: false,
                    },
                    {
                      id: `dyn-cta-${Date.now()}`,
                      type: 'button',
                      props: { label: 'Commander maintenant' },
                      style: {
                        desktop: {
                          backgroundColor: '#5B5BF0',
                          color: '#FFFFFF',
                          padding: '14px 28px',
                          borderRadius: '12px',
                          fontSize: '15px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textAlign: 'center',
                          marginTop: '12px',
                        },
                        tablet: {},
                        mobile: {},
                      },
                      children: [],
                      locked: false,
                      hidden: false,
                    },
                  ],
                  locked: false,
                  hidden: false,
                },
              ],
              locked: false,
              hidden: false,
            },
          ],
          bindings: {},
          locked: false,
          hidden: false,
        },
        graphs: [],
      };

      set((state) => {
        state.project.pages.push(dynamicPage);
        state.activePageId = newPageId;
        state.selectedElementId = null;
        state.selectedElementIds = [];
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);

      get().addToast({
        type: 'success',
        title: 'Page dynamique créée !',
        message: `La page modèle « /${colSlug}/[${slugField}] » est reliée à « ${colName} ».`,
      });
    },

    duplicatePage: (pageId) => {
      const page = get().project.pages.find((p) => p.id === pageId);
      if (!page) return;

      get().pushSnapshot();

      const newPageId = `page-${Date.now()}`;
      const duplicatedPage = {
        ...JSON.parse(JSON.stringify(page)),
        id: newPageId,
        name: `${page.name} (Copie)`,
        slug: `${page.slug}-copie`,
        isHome: false,
        root: cloneElementWithNewIds(page.root),
      };

      set((state) => {
        state.project.pages.push(duplicatedPage);
        state.activePageId = newPageId;
        state.selectedElementId = null;
        state.selectedElementIds = [];
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);

      get().addToast({
        type: 'success',
        title: 'Page dupliquée',
        message: `Une copie de « ${page.name} » a été créée.`,
      });
    },

    deletePage: (pageId) => {
      const pages = get().project.pages;
      if (pages.length <= 1) {
        get().addToast({
          type: 'warning',
          title: 'Action impossible',
          message: 'Votre projet doit contenir au moins une page.',
        });
        return;
      }

      get().pushSnapshot();

      set((state) => {
        const wasHome = state.project.pages.find((p) => p.id === pageId)?.isHome;
        state.project.pages = state.project.pages.filter((p) => p.id !== pageId);
        if (wasHome && state.project.pages.length > 0) {
          state.project.pages[0].isHome = true;
        }
        if (state.activePageId === pageId) {
          state.activePageId = state.project.pages[0].id;
        }
        state.selectedElementId = null;
        state.selectedElementIds = [];
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);

      get().addToast({
        type: 'info',
        title: 'Page supprimée',
        message: 'La page a été retirée du projet.',
      });
    },

    renamePage: (pageId, newName, newSlug) => {
      const trimmed = newName.trim();
      if (!trimmed) return;

      get().pushSnapshot();

      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === pageId);
        if (p) {
          p.name = trimmed;
          if (newSlug) p.slug = newSlug.trim();
        }
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    updatePage: (pageId, update) => {
      set((state) => {
        const p = state.project.pages.find((pg) => pg.id === pageId);
        if (p) {
          Object.assign(p, update);
        }
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    setHomePage: (pageId) => {
      get().pushSnapshot();
      set((state) => {
        for (const p of state.project.pages) {
          p.isHome = p.id === pageId;
        }
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);

      const target = get().project.pages.find((p) => p.id === pageId);
      get().addToast({
        type: 'success',
        title: 'Page d’accueil définie',
        message: `« ${target?.name} » est maintenant la page principale du site.`,
      });
    },

    movePageOrder: (pageId, direction) => {
      const pages = get().project.pages;
      const idx = pages.findIndex((p) => p.id === pageId);
      if (idx === -1) return;

      if (direction === 'up' && idx > 0) {
        get().pushSnapshot();
        set((state) => {
          const temp = state.project.pages[idx - 1];
          state.project.pages[idx - 1] = state.project.pages[idx];
          state.project.pages[idx] = temp;
        });
      } else if (direction === 'down' && idx < pages.length - 1) {
        get().pushSnapshot();
        set((state) => {
          const temp = state.project.pages[idx + 1];
          state.project.pages[idx + 1] = state.project.pages[idx];
          state.project.pages[idx] = temp;
        });
      }

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    reorderPages: (sourceIndex, targetIndex) => {
      const pages = get().project.pages;
      if (
        sourceIndex < 0 ||
        sourceIndex >= pages.length ||
        targetIndex < 0 ||
        targetIndex >= pages.length ||
        sourceIndex === targetIndex
      ) {
        return;
      }

      get().pushSnapshot();
      set((state) => {
        const [moved] = state.project.pages.splice(sourceIndex, 1);
        state.project.pages.splice(targetIndex, 0, moved);
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    // Toasts
    toasts: [],
    addToast: (toast) =>
      set((state) => {
        const id = Math.random().toString(36).substring(2, 9);
        state.toasts.push({ ...toast, id });
      }),
    removeToast: (id) =>
      set((state) => {
        state.toasts = state.toasts.filter((t) => t.id !== id);
      }),

    // Comportement & Logique
    addBehaviorForElement: (elementId: string) => {
      const activePage = get().project.pages.find((p) => p.id === get().activePageId);
      const matched = activePage?.root ? findElementInTree(activePage.root, elementId) : null;
      const element = matched?.element;
      const elType = element?.type || 'element';
      const isInput = elType === 'input' || elType === 'checkbox';

      const eventNodeId = `node-evt-${Date.now()}`;
      const actionNodeId = `node-act-${Date.now() + 1}`;

      const newNodes = [
        {
          id: eventNodeId,
          type: isInput ? 'event_input_change' : 'event_click',
          category: 'event' as const,
          position: { x: 80, y: 150 },
          data: {
            label: isInput ? `Quand ${element?.customName || 'le champ'} change` : `Au clic sur ${element?.customName || 'le bouton'}`,
            targetElementId: elementId,
          },
          inputs: [],
          outputs: ['flow_out', 'target_element'],
        },
        {
          id: actionNodeId,
          type: 'action_show_message',
          category: 'action' as const,
          position: { x: 420, y: 150 },
          data: {
            label: 'Afficher un message',
            messageText: isInput ? 'Valeur mise à jour !' : 'Bouton cliqué avec succès ! ✨',
            messageType: 'success',
          },
          inputs: ['flow_in', 'message_in'],
          outputs: ['flow_out'],
        },
      ];

      const newEdges = [
        {
          id: `e-${Date.now()}`,
          source: eventNodeId,
          target: actionNodeId,
          sourceHandle: 'flow_out',
          targetHandle: 'flow_in',
        },
      ];

      set((state) => {
        const p = state.project.pages.find((page) => page.id === state.activePageId);
        if (p) {
          if (!p.graphs || p.graphs.length === 0) {
            p.graphs = [{ id: `graph-${Date.now()}`, name: 'Logique Interactive', nodes: newNodes, edges: newEdges }];
          } else {
            p.graphs[0].nodes = [...(p.graphs[0].nodes || []), ...newNodes];
            p.graphs[0].edges = [...(p.graphs[0].edges || []), ...newEdges];
          }
        }
        state.editorTab = 'logic';
      });

      get().addToast({
        type: 'success',
        title: 'Comportement créé ! ⚡',
        message: 'Le bloc déclencheur a été pré-configuré pour cet élément.',
        duration: 3500,
      });
    },

    // Liaisons de Données (Data Binding)
    bindElementProp: (elementId: string, propKey: string, bindingExpression: string) => {
      get().pushSnapshot();
      set((state) => {
        const p = state.project.pages.find((page) => page.id === state.activePageId);
        if (p?.root) {
          const matched = findElementInTree(p.root, elementId);
          if (matched?.element) {
            if (!matched.element.bindings) matched.element.bindings = {};
            matched.element.bindings[propKey] = bindingExpression;
          }
        }
      });
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
      get().addToast({
        type: 'success',
        title: 'Donnée reliée ✨',
        message: `Propriété ${propKey} liée à : ${bindingExpression}`,
        duration: 2000,
      });
    },

    unbindElementProp: (elementId: string, propKey: string) => {
      get().pushSnapshot();
      set((state) => {
        const p = state.project.pages.find((page) => page.id === state.activePageId);
        if (p?.root) {
          const matched = findElementInTree(p.root, elementId);
          if (matched?.element && matched.element.bindings) {
            delete matched.element.bindings[propKey];
          }
        }
      });
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    // Gestion des Collections (CMS / Données)
    activeCollectionId: 'col-produits',
    setActiveCollectionId: (id) =>
      set((state) => {
        state.activeCollectionId = id;
      }),

    createCollection: (name: string, slug?: string, description?: string) => {
      const id = `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const cleanSlug = slug?.trim() || name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const newCol: Collection = {
        id,
        name: name.trim(),
        slug: cleanSlug,
        description: description?.trim() || '',
        icon: 'Database',
        fields: [
          {
            id: `fld-nom-${Date.now()}`,
            name: 'Nom',
            key: 'nom',
            type: 'text',
            required: true,
            defaultValue: '',
          },
        ],
        entries: [],
      };

      get().pushSnapshot();
      set((state) => {
        if (!state.project.collections) state.project.collections = [];
        state.project.collections.push(newCol);
        state.activeCollectionId = id;
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);

      get().addToast({
        type: 'success',
        title: 'Collection créée ! 🎉',
        message: `La collection « ${name} » est prête.`,
      });

      return newCol;
    },

    updateCollection: (collectionId, update) => {
      get().pushSnapshot();
      set((state) => {
        const col = state.project.collections?.find((c) => c.id === collectionId);
        if (col) {
          Object.assign(col, update);
        }
      });
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    deleteCollection: (collectionId) => {
      get().pushSnapshot();
      set((state) => {
        if (state.project.collections) {
          state.project.collections = state.project.collections.filter((c) => c.id !== collectionId);
          if (state.activeCollectionId === collectionId) {
            state.activeCollectionId = state.project.collections[0]?.id || null;
          }
        }
      });
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
      get().addToast({
        type: 'info',
        title: 'Collection supprimée',
      });
    },

    addFieldToCollection: (collectionId, field) => {
      const newFieldId = `fld-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      const fieldKey = field.key || field.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

      get().pushSnapshot();
      set((state) => {
        const col = state.project.collections?.find((c) => c.id === collectionId);
        if (col) {
          col.fields.push({
            ...field,
            id: newFieldId,
            key: fieldKey,
          });
        }
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);

      get().addToast({
        type: 'success',
        title: 'Champ ajouté ✨',
        message: `Champ « ${field.name} » (${field.type}) configuré.`,
      });
    },

    updateFieldInCollection: (collectionId, fieldId, update) => {
      get().pushSnapshot();
      set((state) => {
        const col = state.project.collections?.find((c) => c.id === collectionId);
        const fld = col?.fields.find((f) => f.id === fieldId);
        if (fld) {
          Object.assign(fld, update);
        }
      });
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    deleteFieldFromCollection: (collectionId, fieldId) => {
      get().pushSnapshot();
      set((state) => {
        const col = state.project.collections?.find((c) => c.id === collectionId);
        if (col) {
          col.fields = col.fields.filter((f) => f.id !== fieldId);
        }
      });
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    addEntryToCollection: (collectionId, entry) => {
      const entryId = `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();
      const newEntry = {
        ...entry,
        id: entryId,
        createdAt: now,
        updatedAt: now,
      };

      get().pushSnapshot();
      set((state) => {
        const col = state.project.collections?.find((c) => c.id === collectionId);
        if (col) {
          if (!col.entries) col.entries = [];
          col.entries.push(newEntry);
        }
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);

      get().addToast({
        type: 'success',
        title: 'Entrée enregistrée ✨',
        message: 'Nouvelle donnée disponible dans les listes dynamiques.',
      });
    },

    updateEntryInCollection: (collectionId, entryId, data) => {
      get().pushSnapshot();
      set((state) => {
        const col = state.project.collections?.find((c) => c.id === collectionId);
        const entry = col?.entries.find((e) => e.id === entryId);
        if (entry) {
          Object.assign(entry, data, { updatedAt: new Date().toISOString() });
        }
      });
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    duplicateEntryInCollection: (collectionId, entryId) => {
      get().pushSnapshot();
      set((state) => {
        const col = state.project.collections?.find((c) => c.id === collectionId);
        const entry = col?.entries.find((e) => e.id === entryId);
        if (col && entry) {
          const duplicated = {
            ...entry,
            id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            nom: entry.nom ? `${entry.nom} (Copie)` : entry.titre ? `${entry.titre} (Copie)` : 'Copie',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          col.entries.push(duplicated);
        }
      });
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
      get().addToast({
        type: 'success',
        title: 'Entrée dupliquée',
      });
    },

    deleteEntryFromCollection: (collectionId, entryId) => {
      get().pushSnapshot();
      set((state) => {
        const col = state.project.collections?.find((c) => c.id === collectionId);
        if (col) {
          col.entries = col.entries.filter((e) => e.id !== entryId);
        }
      });
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
      get().addToast({
        type: 'info',
        title: 'Entrée supprimée',
      });
    },

    importEntriesFromCSV: (collectionId, entries) => {
      get().pushSnapshot();
      const now = new Date().toISOString();
      const processed = entries.map((item, idx) => ({
        ...item,
        id: `entry-csv-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        createdAt: now,
        updatedAt: now,
      }));

      set((state) => {
        const col = state.project.collections?.find((c) => c.id === collectionId);
        if (col) {
          if (!col.entries) col.entries = [];
          col.entries.push(...processed);
        }
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);

      get().addToast({
        type: 'success',
        title: `${processed.length} entrées importées avec succès ! 📊`,
      });
    },

    // Médiathèque
    addMediaAsset: (asset) => {
      const id = `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newAsset: MediaAsset = {
        ...asset,
        id,
        createdAt: new Date().toISOString(),
      };
      get().pushSnapshot();
      set((state) => {
        if (!state.project.media) state.project.media = [];
        state.project.media.unshift(newAsset);
      });
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
      return newAsset;
    },

    updateMediaAsset: (id, update) => {
      get().pushSnapshot();
      set((state) => {
        const item = state.project.media?.find((m) => m.id === id);
        if (item) Object.assign(item, update);
      });
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    deleteMediaAsset: (id) => {
      get().pushSnapshot();
      set((state) => {
        if (state.project.media) {
          state.project.media = state.project.media.filter((m) => m.id !== id);
        }
      });
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
    },

    // Pages Dynamiques
    setPageDynamic: (pageId, isDynamic, collectionId, slugField) => {
      get().pushSnapshot();
      set((state) => {
        const p = state.project.pages.find((page) => page.id === pageId);
        if (p) {
          p.isDynamic = isDynamic;
          p.dynamicCollectionId = collectionId;
          p.dynamicSlugField = slugField || 'nom';
          if (isDynamic) {
            const col = state.project.collections?.find((c) => c.id === collectionId) || state.project.collections?.[0];
            p.slug = `${(col?.slug || 'produit').toLowerCase()}/[${slugField || 'nom'}]`;
          }
        }
      });
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 800);
      get().addToast({
        type: 'success',
        title: isDynamic ? 'Page modèle dynamique activée 📄' : 'Page standard',
        message: isDynamic ? `Génère automatiquement une URL pour chaque entrée de la collection.` : undefined,
      });
    },

    // Modales
    isPreviewModalOpen: false,
    setPreviewModalOpen: (open) =>
      set((state) => {
        state.isPreviewModalOpen = open;
      }),
    isPublishModalOpen: false,
    setPublishModalOpen: (open) =>
      set((state) => {
        state.isPublishModalOpen = open;
      }),
    isHelpModalOpen: false,
    setHelpModalOpen: (open) =>
      set((state) => {
        state.isHelpModalOpen = open;
      }),

    // Connecteurs & i18n
    isIntegrationsModalOpen: false,
    setIntegrationsModalOpen: (open) =>
      set((state) => {
        state.isIntegrationsModalOpen = open;
      }),
    updateIntegrations: (update) =>
      set((state) => {
        if (!state.project.integrations) {
          state.project.integrations = {
            stripe: { enabled: false, publishableKey: '', secretKey: '' },
            airtable: { enabled: false, apiKey: '', baseId: '' },
            supabase: { enabled: false, url: '', anonKey: '' },
            googleSheets: { enabled: false, spreadsheetId: '', apiKey: '' },
          };
        }
        state.project.integrations = {
          ...state.project.integrations,
          ...update,
        };
      }),

    isI18nModalOpen: false,
    setI18nModalOpen: (open) =>
      set((state) => {
        state.isI18nModalOpen = open;
      }),
    updateI18n: (update) =>
      set((state) => {
        if (!state.project.i18n) {
          state.project.i18n = {
            enabled: false,
            defaultLocale: 'fr',
            supportedLocales: ['fr', 'en', 'es', 'de'],
            activeLocale: 'fr',
            translations: {},
          };
        }
        state.project.i18n = {
          ...state.project.i18n,
          ...update,
        };
      }),
    setI18nActiveLocale: (locale) =>
      set((state) => {
        if (!state.project.i18n) {
          state.project.i18n = {
            enabled: false,
            defaultLocale: 'fr',
            supportedLocales: ['fr', 'en', 'es', 'de'],
            activeLocale: 'fr',
            translations: {},
          };
        }
        state.project.i18n.activeLocale = locale;
      }),

    // Étape 8 : Débutant, Onboarding & Assistance
    experienceMode: 'simple',
    setExperienceMode: (mode) =>
      set((state) => {
        state.experienceMode = mode;
      }),
    toggleExperienceMode: () =>
      set((state) => {
        const next = state.experienceMode === 'simple' ? 'advanced' : 'simple';
        state.experienceMode = next;
      }),

    isWelcomeWizardOpen: false,
    setWelcomeWizardOpen: (open) =>
      set((state) => {
        state.isWelcomeWizardOpen = open;
      }),

    isTourActive: false,
    setTourActive: (active) =>
      set((state) => {
        state.isTourActive = active;
      }),

    isAiAssistantOpen: false,
    setAiAssistantOpen: (open) =>
      set((state) => {
        state.isAiAssistantOpen = open;
      }),

    isVersionHistoryOpen: false,
    setVersionHistoryOpen: (open) =>
      set((state) => {
        state.isVersionHistoryOpen = open;
      }),

    lastSavedTime: new Date().toISOString(),
    versionHistory: [],

    saveVersionSnapshot: (label) =>
      set((state) => {
        const now = new Date();
        const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const snapshot = {
          id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          projectId: state.project.id,
          timestamp: now.toISOString(),
          label: label || `Enregistré à ${timeFormatted}`,
          project: JSON.parse(JSON.stringify(state.project)),
        };
        state.versionHistory.unshift(snapshot);
        if (state.versionHistory.length > 25) {
          state.versionHistory.pop();
        }
      }),

    restoreVersion: (versionId) => {
      const { versionHistory } = get();
      const target = versionHistory.find((v) => v.id === versionId);
      if (!target) return;

      get().pushSnapshot();
      set((state) => {
        state.project = JSON.parse(JSON.stringify(target.project));
        const homePage = state.project.pages.find((p: any) => p.isHome) || state.project.pages[0];
        state.activePageId = homePage?.id || 'page-home';
      });

      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        get().saveCurrentProject();
      }, 500);
    },

    completedMissions: {},
    toggleMissionTask: (taskId) =>
      set((state) => {
        state.completedMissions[taskId] = !state.completedMissions[taskId];
      }),
    resetMissions: () =>
      set((state) => {
        state.completedMissions = {};
      }),
  }))
);
