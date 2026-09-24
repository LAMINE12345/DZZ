import { z } from 'zod';

// Mode d'affichage responsive
export const ViewportModeSchema = z.enum(['desktop', 'tablet', 'mobile']);

// Rôles et catégories de blocs logiques
export const NodeCategorySchema = z.enum(['event', 'action', 'logic', 'data', 'tool', 'comment', 'group']);

// Élément d'interface (Arbre visuel)
export const ResponsiveStyleSchema = z.object({
  desktop: z.record(z.string(), z.any()).default({}),
  tablet: z.record(z.string(), z.any()).default({}),
  mobile: z.record(z.string(), z.any()).default({}),
});

export const ElementSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.string(),
    customName: z.string().optional(),
    props: z.record(z.string(), z.any()).default({}),
    style: ResponsiveStyleSchema.default({ desktop: {}, tablet: {}, mobile: {} }),
    children: z.array(ElementSchema).default([]),
    bindings: z.record(z.string(), z.string()).default({}),
    locked: z.boolean().default(false),
    hidden: z.boolean().default(false),
  })
);

// Nœud de Logique (Graphe no-code)
export const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  category: NodeCategorySchema,
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.string(), z.any()).default({}),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
});

// Connexion entre Nœuds (Edges)
export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
});

// Graphe de Logique
export const GraphSchema = z.object({
  id: z.string(),
  name: z.string(),
  nodes: z.array(NodeSchema).default([]),
  edges: z.array(EdgeSchema).default([]),
});

// Actif Média (Médiathèque d'images & fichiers)
export const MediaAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  alt: z.string().optional().default(''),
  size: z.number().optional().default(0),
  type: z.string().optional().default('image/jpeg'),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
  createdAt: z.string().default(() => new Date().toISOString()),
});

export type MediaAsset = z.infer<typeof MediaAssetSchema>;

// Collection (Base de données simplifiée)
export const CollectionFieldTypeSchema = z.enum([
  'text',
  'long_text',
  'number',
  'image',
  'date',
  'boolean',
  'select',
  'reference',
]);

export const CollectionFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string().optional(),
  type: CollectionFieldTypeSchema,
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  referenceCollectionId: z.string().optional(),
  defaultValue: z.any().optional(),
});

export const CollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  fields: z.array(CollectionFieldSchema).default([]),
  entries: z.array(z.record(z.string(), z.any())).default([]),
});

// Mémoire (Variable simplifiée)
export const MemorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['text', 'number', 'boolean', 'list', 'object']),
  defaultValue: z.any().optional(),
  currentValue: z.any().optional(),
});

// Page SEO Metadata
export const PageSeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
  favicon: z.string().optional(),
  keywords: z.string().optional(),
  schemaType: z.string().optional(),
});

// Page
export const PageSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  isHome: z.boolean().optional().default(false),
  isDynamic: z.boolean().optional(),
  dynamicCollectionId: z.string().optional(),
  dynamicSlugField: z.string().optional(),
  root: ElementSchema,
  graphs: z.array(GraphSchema).optional().default([]),
  seo: PageSeoSchema.optional(),
});

// Thème Global du Projet (5 couleurs de marque + 2 polices + boutons)
export const ProjectThemeSchema = z.object({
  primaryColor: z.string().default('#5B5BF0'),
  accentColor: z.string().default('#14B8A6'),
  backgroundColor: z.string().default('#F7F7FA'),
  surfaceColor: z.string().default('#FFFFFF'),
  textColor: z.string().default('#1B1B2F'),
  headingFont: z.string().default('Plus Jakarta Sans'),
  bodyFont: z.string().default('Inter'),
  radius: z.number().default(12),
  buttonStyle: z.string().default('filled'),
  buttonRadius: z.number().default(12),
  buttonShadow: z.string().default('sm'),
});

export type ProjectTheme = z.infer<typeof ProjectThemeSchema>;

// Connecteurs API & Services Extérieurs
export const IntegrationConfigSchema = z.object({
  stripe: z.object({
    enabled: z.boolean().default(false),
    publishableKey: z.string().default(''),
    secretKey: z.string().default(''),
  }).default({ enabled: false, publishableKey: '', secretKey: '' }),
  airtable: z.object({
    enabled: z.boolean().default(false),
    apiKey: z.string().default(''),
    baseId: z.string().default(''),
  }).default({ enabled: false, apiKey: '', baseId: '' }),
  supabase: z.object({
    enabled: z.boolean().default(false),
    url: z.string().default(''),
    anonKey: z.string().default(''),
  }).default({ enabled: false, url: '', anonKey: '' }),
  googleSheets: z.object({
    enabled: z.boolean().default(false),
    spreadsheetId: z.string().default(''),
    apiKey: z.string().default(''),
  }).default({ enabled: false, spreadsheetId: '', apiKey: '' }),
});

export type IntegrationConfig = z.infer<typeof IntegrationConfigSchema>;

// Internationalisation (i18n)
export const I18nConfigSchema = z.object({
  enabled: z.boolean().default(false),
  defaultLocale: z.string().default('fr'),
  supportedLocales: z.array(z.string()).default(['fr', 'en', 'es', 'de']),
  activeLocale: z.string().default('fr'),
  // translations map: locale -> elementId -> fieldKey -> text
  translations: z.record(z.string(), z.record(z.string(), z.record(z.string(), z.string()))).default({}),
});

export type I18nConfig = z.infer<typeof I18nConfigSchema>;

// Projet Racine
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
  pages: z.array(PageSchema).default([]),
  collections: z.array(CollectionSchema).optional(),
  memories: z.array(MemorySchema).optional(),
  media: z.array(MediaAssetSchema).optional(),
  assets: z.array(z.string()).optional(),
  integrations: IntegrationConfigSchema.optional(),
  i18n: I18nConfigSchema.optional(),
  theme: ProjectThemeSchema.optional(),
  settings: z.object({
    autoSave: z.boolean().default(true),
    darkMode: z.boolean().default(false),
  }).optional().default({
    autoSave: true,
    darkMode: false,
  }),
});
