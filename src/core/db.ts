import { Project } from './types';
import { TEMPLATES } from './templates';

const STORAGE_KEY = 'atelier_projects_db';
const ACTIVE_PROJECT_KEY = 'atelier_active_project_id';

export async function getAllProjectsDB(): Promise<Project[]> {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load projects from storage', e);
    return [];
  }
}

export async function getProjectDB(id: string): Promise<Project | null> {
  const projects = await getAllProjectsDB();
  return projects.find((p) => p.id === id) || null;
}

export async function saveProjectDB(project: Project): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const projects = await getAllProjectsDB();
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx !== -1) {
      projects[idx] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      projects.unshift({ ...project, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save project', e);
  }
}

export async function deleteProjectDB(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const projects = await getAllProjectsDB();
    const filtered = projects.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete project', e);
  }
}

export async function setActiveProjectIdDB(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_PROJECT_KEY, id);
}

export async function seedInitialDataIfEmpty(): Promise<Project[]> {
  const projects = await getAllProjectsDB();
  if (projects.length > 0) {
    return projects;
  }

  const defaultProject: Project = {
    id: 'proj-default-1',
    name: 'Mon Super Site Web',
    description: 'Site web moderne créé avec Atelier et ses balises HTML sémantiques.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
      buttonRadius: 10,
      buttonShadow: 'sm',
    },
    pages: [
      {
        id: 'page-home',
        name: 'Accueil',
        slug: 'index',
        isHome: true,
        root: {
          id: 'root-element',
          type: 'section',
          props: { layoutMode: 'auto', tag: 'main' },
          style: {
            desktop: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' },
            tablet: { padding: '24px 16px' },
            mobile: { padding: '16px 12px' },
          },
          children: [
            {
              id: 'sec-hero-init',
              type: 'section',
              props: { tag: 'header', layoutMode: 'auto' },
              style: {
                desktop: {
                  padding: '60px 24px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
                },
                tablet: { padding: '40px 20px' },
                mobile: { padding: '24px 16px' },
              },
              children: [
                {
                  id: 'badge-init',
                  type: 'badge',
                  props: { text: '✨ Nouveau & Sémantique', iconName: 'Sparkles' },
                  style: {
                    desktop: {
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      backgroundColor: '#EEF0FE',
                      color: '#5B5BF0',
                      fontSize: '12px',
                      fontWeight: '700',
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
                  id: 'h1-init',
                  type: 'heading',
                  props: { text: 'Créez avec des Balises HTML & No-Code', tag: 'h1' },
                  style: {
                    desktop: { fontSize: '40px', fontWeight: '800', color: '#1B1B2F' },
                    tablet: { fontSize: '30px' },
                    mobile: { fontSize: '24px' },
                  },
                  children: [],
                  bindings: {},
                  locked: false,
                  hidden: false,
                },
                {
                  id: 'p-init',
                  type: 'text',
                  props: {
                    text: 'Concevez vos pages web visuellement avec des balises sémantiques : headers, nav, articles, sections, blockquotes, tableaux, accordéons, audio, iframes et code HTML personnalisé.',
                    tag: 'p',
                  },
                  style: {
                    desktop: { fontSize: '16px', color: '#62627A', maxWidth: '680px' },
                    tablet: { fontSize: '15px' },
                    mobile: { fontSize: '14px' },
                  },
                  children: [],
                  bindings: {},
                  locked: false,
                  hidden: false,
                },
                {
                  id: 'btn-init',
                  type: 'button',
                  props: { label: 'Explorer les balises HTML', linkUrl: '#elements' },
                  style: {
                    desktop: {
                      padding: '12px 28px',
                      backgroundColor: '#5B5BF0',
                      color: '#FFFFFF',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '15px',
                    },
                    tablet: {},
                    mobile: { width: '100%' },
                  },
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
          ],
          bindings: {},
          locked: false,
          hidden: false,
        },
        graphs: [],
        seo: {
          title: 'Mon Super Site Web – Accueil',
          description: 'Découvrez notre site interactif avec balises HTML.',
        },
      },
    ],
    collections: [
      {
        id: 'col-produits',
        name: 'Produits',
        slug: 'produits',
        description: 'Catalogue des articles et services',
        fields: [
          { id: 'f-1', name: 'Nom', key: 'nom', type: 'text', required: true },
          { id: 'f-2', name: 'Description', key: 'description', type: 'long_text', required: false },
          { id: 'f-3', name: 'Prix', key: 'prix', type: 'number', required: true },
          { id: 'f-4', name: 'Image', key: 'image', type: 'image', required: false },
          { id: 'f-5', name: 'Catégorie', key: 'categorie', type: 'text', required: false },
        ],
        entries: [
          {
            id: 'prod-1',
            nom: 'Pack Créateur Pro',
            description: 'Solution complète pour bâtir votre présence en ligne rapidement.',
            prix: 49,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
            categorie: 'Logiciel',
          },
          {
            id: 'prod-2',
            nom: 'Formation HTML Sémantique',
            description: 'Maîtrisez toutes les balises du web moderne de façon intuitive.',
            prix: 29,
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
            categorie: 'Cours',
          },
        ],
      },
    ],
    memories: [],
    media: [],
    integrations: {
      stripe: { enabled: false, publishableKey: '', secretKey: '' },
      airtable: { enabled: false, apiKey: '', baseId: '' },
      supabase: { enabled: false, url: '', anonKey: '' },
      googleSheets: { enabled: false, spreadsheetId: '', apiKey: '' },
    },
    i18n: {
      enabled: false,
      defaultLocale: 'fr',
      supportedLocales: ['fr', 'en', 'es', 'de'],
      activeLocale: 'fr',
      translations: {},
    },
    settings: {
      autoSave: true,
      darkMode: false,
    },
  };

  await saveProjectDB(defaultProject);
  return [defaultProject];
}
