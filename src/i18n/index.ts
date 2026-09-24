export function t(key: string, fallback?: string): string {
  const translations: Record<string, string> = {
    'editor.elements.section': 'Section',
    'editor.elements.columns': 'Colonnes',
    'editor.elements.box': 'Cadre / Boîte',
    'editor.elements.heading': 'Titre',
    'editor.elements.text': 'Paragraphe de texte',
    'editor.elements.button': 'Bouton d’action',
    'editor.elements.icon': 'Icône décorative',
    'editor.elements.badge': 'Balise / Badge',
    'editor.elements.image': 'Image / Photo',
    'editor.elements.video': 'Lecteur Vidéo',
    'editor.elements.shape': 'Forme géométrique',
    'editor.elements.form': 'Formulaire complet',
    'editor.elements.input': 'Champ de saisie',
    'editor.elements.checkbox': 'Case à cocher',
    'editor.elements.list': 'Liste à puces',
    'editor.elements.dynamic_list': 'Liste dynamique (CMS)',
    'editor.elements.custom_html': 'Balise HTML brute / Code',
    'editor.elements.link': 'Lien hypertexte (<a>)',
    'editor.elements.divider': 'Séparateur (<hr>)',
    'editor.elements.blockquote': 'Citation (<blockquote>)',
    'editor.elements.code_block': 'Bloc de code (<pre><code>)',
    'editor.elements.table': 'Tableau HTML (<table>)',
    'editor.elements.accordion': 'Accordéon / Détails (<details>)',
    'editor.elements.audio': 'Lecteur Audio (<audio>)',
    'editor.elements.iframe': 'Intégration Web (<iframe>)',
  };

  return translations[key] || fallback || key;
}
