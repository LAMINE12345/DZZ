import { Collection, MediaAsset } from './types';

export const DEFAULT_PRODUCTS_COLLECTION: Collection = {
  id: 'col-produits',
  name: 'Produits',
  slug: 'produits',
  description: 'Catalogue de nos produits et services',
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
      description: 'Solution complète pour bâtir votre présence en ligne rapidement avec des balises sémantiques.',
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
};

export const DEFAULT_ARTICLES_COLLECTION: Collection = {
  id: 'col-articles',
  name: 'Articles de Blog',
  slug: 'articles',
  description: 'Publications et actualités',
  fields: [
    { id: 'fa-1', name: 'Titre', key: 'titre', type: 'text', required: true },
    { id: 'fa-2', name: 'Extrait', key: 'extrait', type: 'long_text', required: false },
    { id: 'fa-3', name: 'Date', key: 'date', type: 'date', required: false },
    { id: 'fa-4', name: 'Image de couverture', key: 'couverture', type: 'image', required: false },
  ],
  entries: [
    {
      id: 'art-1',
      titre: 'Pourquoi les balises sémantiques sont essentielles en 2026',
      extrait: 'Découvrez comment <article>, <section> et <nav> propulsent votre référencement.',
      date: '2026-03-15',
      couverture: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
    },
  ],
};

export const DEFAULT_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'media-1',
    name: 'Hero Nature',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    alt: 'Magnifique paysage naturel',
    type: 'image',
    size: 245000,
    dimensions: { width: 800, height: 533 },
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_CMS_COLLECTIONS: Collection[] = [
  DEFAULT_PRODUCTS_COLLECTION,
  DEFAULT_ARTICLES_COLLECTION,
];
