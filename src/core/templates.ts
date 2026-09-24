import { Project } from './types';

export interface ProjectTemplate {
  id: string;
  name: string;
  nameKey?: string;
  category: string;
  description: string;
  previewImage: string;
  project: Project;
  createProject: () => Project;
}

export const createBlankProject = (): Project => ({
  id: 'proj-default',
  name: 'Nouveau Projet',
  description: 'Site web créé avec Atelier',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  pages: [
    {
      id: 'page-home-default',
      name: 'Accueil',
      slug: 'index',
      isHome: true,
      root: {
        id: 'root-default',
        type: 'section',
        props: { layoutMode: 'auto', tag: 'main' },
        style: {
          desktop: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' },
          tablet: { padding: '24px 16px' },
          mobile: { padding: '16px 12px' },
        },
        children: [
          {
            id: 'h1-default',
            type: 'heading',
            props: { text: 'Bienvenue sur votre nouveau site', tag: 'h1' },
            style: {
              desktop: { fontSize: '36px', fontWeight: '800', marginBottom: '16px', color: '#1B1B2F' },
              tablet: { fontSize: '28px' },
              mobile: { fontSize: '24px' },
            },
            bindings: {},
            children: [],
          },
          {
            id: 'p-default',
            type: 'text',
            props: { text: 'Concevez votre site avec toutes les balises HTML sémantiques disponibles dans la barre latérale.', tag: 'p' },
            style: {
              desktop: { fontSize: '16px', lineHeight: '1.6', color: '#62627A', marginBottom: '24px' },
              tablet: { fontSize: '15px' },
              mobile: { fontSize: '14px' },
            },
            bindings: {},
            children: [],
          },
        ],
        bindings: {},
        locked: false,
        hidden: false,
      },
      graphs: [],
    },
  ],
  collections: [],
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
});

export const TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Projet Vierge',
    nameKey: 'templates.blank',
    category: 'Général',
    description: 'Une page blanche pour construire votre projet librement avec toutes les balises HTML.',
    previewImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80',
    project: createBlankProject(),
    createProject: createBlankProject,
  },
];
