import { Project } from '@/src/core/types';

export interface MigrationResult {
  migratedProject: Project;
  wasMigrated: boolean;
  originalVersion: number | string;
  appliedFixes: string[];
}

export function migrateProjectSchema(rawProject: any): MigrationResult {
  if (!rawProject) throw new Error('Données de projet invalides');

  const appliedFixes: string[] = [];
  const originalVersion = rawProject.schemaVersion || rawProject.version || 1;

  if (!rawProject.settings) {
    appliedFixes.push('Ajout des paramètres par défaut');
  }
  if (!rawProject.integrations) {
    appliedFixes.push('Initialisation des intégrations Stripe & Supabase');
  }
  if (!rawProject.collections) {
    appliedFixes.push('Initialisation des collections CMS');
  }

  const migratedProject: Project = {
    id: rawProject.id || `proj-${Date.now()}`,
    name: rawProject.name || 'Projet Sans Titre',
    description: rawProject.description || '',
    createdAt: rawProject.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages: Array.isArray(rawProject.pages) ? rawProject.pages : [],
    collections: Array.isArray(rawProject.collections) ? rawProject.collections : [],
    memories: Array.isArray(rawProject.memories) ? rawProject.memories : [],
    media: Array.isArray(rawProject.media) ? rawProject.media : [],
    theme: rawProject.theme || {
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
    integrations: rawProject.integrations || {
      stripe: { enabled: false, publishableKey: '', secretKey: '' },
      airtable: { enabled: false, apiKey: '', baseId: '' },
      supabase: { enabled: false, url: '', anonKey: '' },
      googleSheets: { enabled: false, spreadsheetId: '', apiKey: '' },
    },
    i18n: rawProject.i18n || {
      enabled: false,
      defaultLocale: 'fr',
      supportedLocales: ['fr', 'en'],
      activeLocale: 'fr',
      translations: {},
    },
    settings: rawProject.settings || {
      autoSave: true,
      darkMode: false,
    },
  };

  return {
    migratedProject,
    wasMigrated: appliedFixes.length > 0,
    originalVersion,
    appliedFixes,
  };
}
