import { LogicNodeDefinition } from './types';

export const LOGIC_CATALOG: LogicNodeDefinition[] = [
  // ==========================================
  // 1. ÉVÉNEMENTS (Ambre)
  // ==========================================
  {
    type: 'event_page_load',
    category: 'event',
    name: 'Au chargement de la page',
    description: 'Déclenche des actions dès que le visiteur arrive sur cette page.',
    iconName: 'PlayCircle',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Démarrer' },
    ],
    fields: [],
    defaultData: { label: 'Au chargement de la page' },
  },
  {
    type: 'event_click',
    category: 'event',
    name: 'Quand on clique sur…',
    description: 'Déclenche des actions lors d’un clic ou appui sur un bouton ou élément.',
    iconName: 'MousePointerClick',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Au clic' },
      { id: 'target_element', name: 'Élément', type: 'data', dataType: 'element', label: 'Élément cliqué' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Élément cible',
        type: 'elementPicker',
        tooltip: 'Sélectionnez le bouton ou le bloc qui écoute le clic.',
        placeholder: 'Choisir sur la page…',
      },
    ],
    defaultData: { label: 'Quand on clique sur…', targetElementId: '' },
  },
  {
    type: 'event_hover',
    category: 'event',
    name: 'Quand on survole…',
    description: 'Déclenche des actions lorsque le pointeur entre ou quitte un élément.',
    iconName: 'Hand',
    inputs: [],
    outputs: [
      { id: 'flow_enter', name: 'Entrée', type: 'flow', label: 'Survol actif' },
      { id: 'flow_leave', name: 'Sortie', type: 'flow', label: 'Fin de survol' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Élément à survoler',
        type: 'elementPicker',
        tooltip: 'Élément visuel surveillé pour le survol.',
      },
    ],
    defaultData: { label: 'Quand on survole…', targetElementId: '' },
  },
  {
    type: 'event_input_change',
    category: 'event',
    name: 'Quand un champ change',
    description: 'Déclenche des actions dès qu’un texte est saisi ou une case cochée.',
    iconName: 'TextCursorInput',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Modification' },
      { id: 'value_out', name: 'Valeur', type: 'data', dataType: 'any', label: 'Nouvelle valeur' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Champ ou case',
        type: 'elementPicker',
        tooltip: 'Le champ de saisie surveillé.',
      },
    ],
    defaultData: { label: 'Quand un champ change', targetElementId: '' },
  },
  {
    type: 'event_form_submit',
    category: 'event',
    name: 'Quand le formulaire est envoyé',
    description: 'Déclenche des actions lors de la validation du formulaire.',
    iconName: 'Send',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'À l’envoi' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Formulaire cible',
        type: 'elementPicker',
        tooltip: 'Le conteneur ou bloc formulaire concerné.',
      },
    ],
    defaultData: { label: 'Quand le formulaire est envoyé', targetElementId: '' },
  },
  {
    type: 'event_timer',
    category: 'event',
    name: 'Toutes les X secondes',
    description: 'Répète une action automatiquement à intervalles réguliers.',
    iconName: 'Clock',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'À chaque battement' },
      { id: 'tick_count', name: 'Compteur', type: 'data', dataType: 'number', label: 'Nombre de cycles' },
    ],
    fields: [
      {
        key: 'intervalSeconds',
        label: 'Intervalle (secondes)',
        type: 'number',
        defaultValue: 3,
        tooltip: 'Nombre de secondes entre chaque répétition.',
      },
      {
        key: 'autoStart',
        label: 'Démarrage immédiat',
        type: 'boolean',
        defaultValue: true,
      },
    ],
    defaultData: { label: 'Toutes les 3s', intervalSeconds: 3, autoStart: true },
  },
  {
    type: 'event_scroll',
    category: 'event',
    name: 'Au défilement de la page',
    description: 'Déclenche des actions selon la position de défilement vertical.',
    iconName: 'ArrowDownCircle',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Au défilement' },
      { id: 'scroll_percent', name: 'Position', type: 'data', dataType: 'number', label: 'Pourcentage défilé' },
    ],
    fields: [
      {
        key: 'threshold',
        label: 'Seuil (pixels)',
        type: 'number',
        defaultValue: 100,
        tooltip: 'Distance minimale de défilement pour déclencher.',
      },
    ],
    defaultData: { label: 'Au défilement (>100px)', threshold: 100 },
  },
  {
    type: 'event_double_click',
    category: 'event',
    name: 'Quand on double-clique',
    description: 'Déclenche des actions lors d’un double-clic rapide sur un élément.',
    iconName: 'MousePointerClick',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Au double-clic' },
      { id: 'target_element', name: 'Élément', type: 'data', dataType: 'element', label: 'Élément ciblé' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Élément cible',
        type: 'elementPicker',
        tooltip: 'Sélectionnez l’élément qui écoute le double-clic.',
      },
    ],
    defaultData: { label: 'Double-clic sur…', targetElementId: '' },
  },
  {
    type: 'event_right_click',
    category: 'event',
    name: 'Au clic droit (Menu contextuel)',
    description: 'Déclenche des actions personnalisées lors d’un clic droit.',
    iconName: 'MousePointer',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Au clic droit' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Zone ou élément',
        type: 'elementPicker',
      },
      {
        key: 'preventBrowserMenu',
        label: 'Bloquer le menu par défaut du navigateur',
        type: 'boolean',
        defaultValue: true,
      },
    ],
    defaultData: { label: 'Au clic droit', targetElementId: '', preventBrowserMenu: true },
  },
  {
    type: 'event_focus',
    category: 'event',
    name: 'Quand un champ prend le focus',
    description: 'Déclenché quand le visiteur clique ou commence à taper dans un champ.',
    iconName: 'ScanLine',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Focus actif' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Champ de saisie',
        type: 'elementPicker',
      },
    ],
    defaultData: { label: 'Prise de focus', targetElementId: '' },
  },
  {
    type: 'event_blur',
    category: 'event',
    name: 'Quand un champ perd le focus',
    description: 'Déclenché dès que l’utilisateur quitte un champ (parfait pour la validation instantanée).',
    iconName: 'Eye',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Perte de focus' },
      { id: 'value_out', name: 'Valeur', type: 'data', dataType: 'text', label: 'Contenu saisi' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Champ de saisie',
        type: 'elementPicker',
      },
    ],
    defaultData: { label: 'Perte de focus', targetElementId: '' },
  },
  {
    type: 'event_key_press',
    category: 'event',
    name: 'Touche clavier enfoncée',
    description: 'Écoute les raccourcis ou touches spécifiques (Entrée, Échap, Espace, Flèches).',
    iconName: 'Terminal',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Touche pressée' },
      { id: 'key_code', name: 'Code touche', type: 'data', dataType: 'text', label: 'Nom de la touche' },
    ],
    fields: [
      {
        key: 'targetKey',
        label: 'Touche à écouter',
        type: 'select',
        options: [
          { label: 'Touche Entrée (Enter)', value: 'Enter' },
          { label: 'Touche Échap (Escape)', value: 'Escape' },
          { label: 'Barre d’espace (Space)', value: ' ' },
          { label: 'Flèche vers le haut (ArrowUp)', value: 'ArrowUp' },
          { label: 'Flèche vers le bas (ArrowDown)', value: 'ArrowDown' },
          { label: 'Touche Tabulation (Tab)', value: 'Tab' },
          { label: 'N’importe quelle touche', value: '*' },
        ],
        defaultValue: 'Enter',
      },
    ],
    defaultData: { label: 'Touche Entrée pressée', targetKey: 'Enter' },
  },
  {
    type: 'event_form_reset',
    category: 'event',
    name: 'Quand le formulaire est réinitialisé',
    description: 'Déclenché lorsque le formulaire est vidé ou remis à zéro.',
    iconName: 'RotateCw',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Après reset' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Formulaire',
        type: 'elementPicker',
      },
    ],
    defaultData: { label: 'Formulaire remis à zéro', targetElementId: '' },
  },
  {
    type: 'event_in_viewport',
    category: 'event',
    name: 'Quand l’élément apparaît à l’écran',
    description: 'Déclenché lorsque le visiteur fait défiler la page jusqu’à rendre le bloc visible.',
    iconName: 'ScanLine',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Élément visible' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Élément à surveiller',
        type: 'elementPicker',
      },
      {
        key: 'once',
        label: 'Déclencher une seule fois',
        type: 'boolean',
        defaultValue: true,
      },
    ],
    defaultData: { label: 'Apparition à l’écran', targetElementId: '', once: true },
  },
  {
    type: 'event_window_resize',
    category: 'event',
    name: 'Au redimensionnement d’écran',
    description: 'Déclenché lors du passage Mobile / Tablette / Desktop ou changement de fenêtre.',
    iconName: 'Layers2',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Taille modifiée' },
      { id: 'width_out', name: 'Largeur', type: 'data', dataType: 'number', label: 'Largeur en px' },
      { id: 'is_mobile', name: 'Est Mobile', type: 'data', dataType: 'boolean', label: '< 768px' },
    ],
    fields: [],
    defaultData: { label: 'Redimensionnement d’écran' },
  },
  {
    type: 'event_exit_intent',
    category: 'event',
    name: 'Intention de sortie (Exit Intent)',
    description: 'Déclenché lorsque le pointeur de la souris s’apprête à quitter la fenêtre en haut.',
    iconName: 'ExternalLink',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Tentative de départ' },
    ],
    fields: [
      {
        key: 'triggerOnce',
        label: 'Déclencher une seule fois par session',
        type: 'boolean',
        defaultValue: true,
      },
    ],
    defaultData: { label: 'Intention de sortie', triggerOnce: true },
  },
  {
    type: 'event_copy_paste',
    category: 'event',
    name: 'À la copie ou collage de texte',
    description: 'Déclenché quand un visiteur copie ou colle un texte dans vos champs.',
    iconName: 'Copy',
    inputs: [],
    outputs: [
      { id: 'flow_copy', name: 'Copie', type: 'flow', label: 'Si Copié' },
      { id: 'flow_paste', name: 'Collage', type: 'flow', label: 'Si Collé' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Champ ou zone surveillée',
        type: 'elementPicker',
      },
    ],
    defaultData: { label: 'Copie / Collage détecté', targetElementId: '' },
  },
  {
    type: 'event_online_offline',
    category: 'event',
    name: 'Connexion réseau (Online / Offline)',
    description: 'Détecte en temps réel les pertes et reprises de connectivité Internet.',
    iconName: 'Globe',
    inputs: [],
    outputs: [
      { id: 'flow_online', name: 'En ligne', type: 'flow', label: 'Connexion rétablie' },
      { id: 'flow_offline', name: 'Hors ligne', type: 'flow', label: 'Connexion perdue' },
    ],
    fields: [],
    defaultData: { label: 'Statut Réseau' },
  },
  {
    type: 'event_visibility_change',
    category: 'event',
    name: 'Changement d’onglet (Visible / Arrière-plan)',
    description: 'Déclenché quand l’utilisateur change d’onglet ou revient sur votre site.',
    iconName: 'Eye',
    inputs: [],
    outputs: [
      { id: 'flow_active', name: 'Onglet actif', type: 'flow', label: 'De retour sur le site' },
      { id: 'flow_hidden', name: 'Onglet masqué', type: 'flow', label: 'Parti sur un autre onglet' },
    ],
    fields: [],
    defaultData: { label: 'Changement d’onglet' },
  },
  {
    type: 'event_delay',
    category: 'event',
    name: 'Minuteur unique (Délai après ouverture)',
    description: 'Déclenche un flux une seule fois après X secondes de présence sur la page.',
    iconName: 'Clock',
    inputs: [],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Après le délai' },
    ],
    fields: [
      {
        key: 'delaySeconds',
        label: 'Délai d’attente (secondes)',
        type: 'number',
        defaultValue: 5,
      },
    ],
    defaultData: { label: 'Après 5 secondes', delaySeconds: 5 },
  },

  // ==========================================
  // 2. ACTIONS (Bleu)
  // ==========================================
  {
    type: 'action_toggle_visibility',
    category: 'action',
    name: 'Afficher / Masquer',
    description: 'Affiche, cache ou alterne la visibilité d’un élément de la page.',
    iconName: 'Eye',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'target_in', name: 'Élément', type: 'data', dataType: 'element', label: 'Cible (optionnel)' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
      { id: 'is_visible', name: 'Visible', type: 'data', dataType: 'boolean', label: 'État actuel' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Élément cible',
        type: 'elementPicker',
        tooltip: 'L’élément à afficher ou masquer.',
      },
      {
        key: 'visibilityAction',
        label: 'Action',
        type: 'select',
        options: [
          { label: 'Alterner (Afficher si masqué, masquer si visible)', value: 'toggle' },
          { label: 'Toujours Afficher', value: 'show' },
          { label: 'Toujours Masquer', value: 'hide' },
        ],
        defaultValue: 'toggle',
      },
    ],
    defaultData: { label: 'Afficher / Masquer', targetElementId: '', visibilityAction: 'toggle' },
  },
  {
    type: 'action_set_text',
    category: 'action',
    name: 'Changer le texte',
    description: 'Modifie le texte affiché dans un titre, paragraphe ou bouton.',
    iconName: 'Type',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'new_text_in', name: 'Nouveau texte', type: 'data', dataType: 'text', label: 'Texte dynamique' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Élément à modifier',
        type: 'elementPicker',
        tooltip: 'Le titre ou paragraphe dont le texte doit changer.',
      },
      {
        key: 'textValue',
        label: 'Texte de remplacement',
        type: 'text',
        placeholder: 'Tapez le nouveau texte ici…',
        defaultValue: 'Nouveau texte dynamique !',
      },
    ],
    defaultData: { label: 'Changer le texte', targetElementId: '', textValue: 'Nouveau texte !' },
  },
  {
    type: 'action_set_style',
    category: 'action',
    name: 'Changer une couleur / style',
    description: 'Modifie instantanément la couleur, le fond ou le style d’un bloc.',
    iconName: 'Palette',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'color_in', name: 'Couleur', type: 'data', dataType: 'text', label: 'Couleur dynamique' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Élément à modifier',
        type: 'elementPicker',
      },
      {
        key: 'styleProperty',
        label: 'Propriété visuelle',
        type: 'select',
        options: [
          { label: 'Couleur d’arrière-plan', value: 'backgroundColor' },
          { label: 'Couleur du texte', value: 'color' },
          { label: 'Couleur de bordure', value: 'borderColor' },
        ],
        defaultValue: 'backgroundColor',
      },
      {
        key: 'colorValue',
        label: 'Nouvelle couleur',
        type: 'color',
        defaultValue: '#5B5BF0',
      },
    ],
    defaultData: { label: 'Changer couleur', targetElementId: '', styleProperty: 'backgroundColor', colorValue: '#5B5BF0' },
  },
  {
    type: 'action_navigate_page',
    category: 'action',
    name: 'Aller à une page',
    description: 'Redirige le visiteur vers une autre page de votre projet.',
    iconName: 'FileSymlink',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'targetPageId',
        label: 'Page de destination',
        type: 'pagePicker',
        tooltip: 'Choisissez la page vers laquelle naviguer.',
      },
    ],
    defaultData: { label: 'Aller à la page', targetPageId: '' },
  },
  {
    type: 'action_open_url',
    category: 'action',
    name: 'Ouvrir un lien',
    description: 'Ouvre un lien externe vers un site web ou une ressource.',
    iconName: 'ExternalLink',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'url_in', name: 'URL', type: 'data', dataType: 'text', label: 'Lien dynamique' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'url',
        label: 'Adresse Web (URL)',
        type: 'text',
        placeholder: 'https://mon-site.com',
        defaultValue: 'https://',
      },
      {
        key: 'openInNewTab',
        label: 'Ouvrir dans un nouvel onglet',
        type: 'boolean',
        defaultValue: true,
      },
    ],
    defaultData: { label: 'Ouvrir un lien', url: 'https://', openInNewTab: true },
  },
  {
    type: 'action_show_message',
    category: 'action',
    name: 'Afficher un message',
    description: 'Affiche une notification toast conviviale pour informer le visiteur.',
    iconName: 'BellRing',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'message_in', name: 'Message', type: 'data', dataType: 'text', label: 'Texte dynamique' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'messageText',
        label: 'Message à afficher',
        type: 'text',
        defaultValue: 'Action réussie avec succès ! ✨',
      },
      {
        key: 'messageType',
        label: 'Type de notification',
        type: 'select',
        options: [
          { label: 'Succès (Vert)', value: 'success' },
          { label: 'Information (Bleu)', value: 'info' },
          { label: 'Avertissement (Orange)', value: 'warning' },
          { label: 'Erreur (Rouge)', value: 'error' },
        ],
        defaultValue: 'success',
      },
    ],
    defaultData: { label: 'Afficher un message', messageText: 'Bravo ! Action réussie.', messageType: 'success' },
  },
  {
    type: 'action_play_animation',
    category: 'action',
    name: 'Jouer une animation',
    description: 'Anime un bloc avec un effet visuel (sursaut, pulsation, glissement).',
    iconName: 'Sparkles',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Élément à animer',
        type: 'elementPicker',
      },
      {
        key: 'animationType',
        label: 'Effet d’animation',
        type: 'select',
        options: [
          { label: 'Sursaut (Bounce)', value: 'bounce' },
          { label: 'Pulsation (Pulse)', value: 'pulse' },
          { label: 'Zoom léger (Zoom)', value: 'zoom-in' },
          { label: 'Glissement vers le haut', value: 'slide-up' },
        ],
        defaultValue: 'bounce',
      },
    ],
    defaultData: { label: 'Jouer une animation', targetElementId: '', animationType: 'bounce' },
  },
  {
    type: 'action_api_call',
    category: 'action',
    name: 'Appeler un service en ligne',
    description: 'Envoie ou récupère des données via une requête Web/API sécurisée.',
    iconName: 'Globe',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'body_in', name: 'Données', type: 'data', dataType: 'any', label: 'Corps de la requête' },
    ],
    outputs: [
      { id: 'flow_success', name: 'Succès', type: 'flow', label: 'Si succès' },
      { id: 'flow_error', name: 'Erreur', type: 'flow', label: 'Si échec' },
      { id: 'response_data', name: 'Réponse', type: 'data', dataType: 'any', label: 'Résultat reçu' },
    ],
    fields: [
      {
        key: 'apiUrl',
        label: 'Adresse du service (URL)',
        type: 'text',
        placeholder: 'https://api.exemple.fr/donnees',
      },
      {
        key: 'method',
        label: 'Méthode',
        type: 'select',
        options: [
          { label: 'GET (Lire les données)', value: 'GET' },
          { label: 'POST (Envoyer des données)', value: 'POST' },
        ],
        defaultValue: 'GET',
      },
    ],
    defaultData: { label: 'Appel Service Web', apiUrl: '', method: 'GET' },
  },
  {
    type: 'action_collection_insert',
    category: 'action',
    name: 'Ajouter dans une collection',
    description: 'Enregistre une nouvelle ligne dans votre base de données sans code.',
    iconName: 'DatabaseZap',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'record_in', name: 'Valeurs', type: 'data', dataType: 'any', label: 'Champs à enregistrer' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
      { id: 'new_id', name: 'Nouvel ID', type: 'data', dataType: 'text', label: 'Identifiant généré' },
    ],
    fields: [
      {
        key: 'collectionId',
        label: 'Collection cible',
        type: 'collectionPicker',
        tooltip: 'Choisissez la table de données où insérer la ligne.',
      },
    ],
    defaultData: { label: 'Ajouter dans collection', collectionId: '' },
  },
  {
    type: 'action_collection_update',
    category: 'action',
    name: 'Modifier dans une collection',
    description: 'Met à jour les informations d’une ligne existante dans une collection.',
    iconName: 'FileEdit',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'entry_id', name: 'ID Ligne', type: 'data', dataType: 'text', label: 'Identifiant' },
      { id: 'new_values', name: 'Nouvelles valeurs', type: 'data', dataType: 'any', label: 'Modifications' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'collectionId',
        label: 'Collection cible',
        type: 'collectionPicker',
      },
    ],
    defaultData: { label: 'Modifier dans collection', collectionId: '' },
  },
  {
    type: 'action_collection_delete',
    category: 'action',
    name: 'Supprimer de la collection',
    description: 'Supprime un enregistrement spécifique de votre collection de données.',
    iconName: 'Trash2',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'entry_id', name: 'ID Ligne', type: 'data', dataType: 'text', label: 'Identifiant' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'collectionId',
        label: 'Collection cible',
        type: 'collectionPicker',
      },
    ],
    defaultData: { label: 'Supprimer de collection', collectionId: '' },
  },
  {
    type: 'action_copy_clipboard',
    category: 'action',
    name: 'Copier dans le presse-papier',
    description: 'Copie un texte ou code promo dans le presse-papier de l’ordinateur ou smartphone.',
    iconName: 'Copy',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Copier' },
      { id: 'text_in', name: 'Texte', type: 'data', dataType: 'text', label: 'Texte dynamique' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Succès', type: 'flow', label: 'Après copie' },
    ],
    fields: [
      {
        key: 'textToCopy',
        label: 'Texte ou code à copier',
        type: 'text',
        defaultValue: 'PROMO2025',
      },
    ],
    defaultData: { label: 'Copier dans presse-papier', textToCopy: 'PROMO2025' },
  },
  {
    type: 'action_scroll_to',
    category: 'action',
    name: 'Défiler vers un élément ou ancre',
    description: 'Défile fluidement la page vers un bloc, une section ou tout en haut.',
    iconName: 'ArrowDownCircle',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Défiler' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Élément ou section de destination',
        type: 'elementPicker',
      },
      {
        key: 'behavior',
        label: 'Style de défilement',
        type: 'select',
        options: [
          { label: 'Fluide et doux (Smooth)', value: 'smooth' },
          { label: 'Instantané (Direct)', value: 'instant' },
        ],
        defaultValue: 'smooth',
      },
    ],
    defaultData: { label: 'Défiler vers élément', targetElementId: '', behavior: 'smooth' },
  },
  {
    type: 'action_set_input_value',
    category: 'action',
    name: 'Préremplir la valeur d’un champ',
    description: 'Définit dynamiquement le contenu textuel ou numérique d’un champ de saisie.',
    iconName: 'TextCursorInput',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Définir' },
      { id: 'value_in', name: 'Valeur', type: 'data', dataType: 'any', label: 'Valeur dynamique' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Champ de formulaire',
        type: 'elementPicker',
      },
      {
        key: 'inputValue',
        label: 'Valeur par défaut',
        type: 'text',
        defaultValue: '',
      },
    ],
    defaultData: { label: 'Remplir champ', targetElementId: '', inputValue: '' },
  },
  {
    type: 'action_reset_form',
    category: 'action',
    name: 'Vider le formulaire',
    description: 'Réinitialise instantanément tous les champs de saisie du formulaire.',
    iconName: 'RotateCw',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Réinitialiser' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Après reset' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Formulaire à vider',
        type: 'elementPicker',
      },
    ],
    defaultData: { label: 'Vider formulaire', targetElementId: '' },
  },
  {
    type: 'action_focus_element',
    category: 'action',
    name: 'Donner le focus à un champ',
    description: 'Place automatiquement le curseur de frappe dans un champ de saisie choisi.',
    iconName: 'TextCursorInput',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Activer' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Champ cible',
        type: 'elementPicker',
      },
    ],
    defaultData: { label: 'Focus sur champ', targetElementId: '' },
  },
  {
    type: 'action_play_sound',
    category: 'action',
    name: 'Jouer un son audio',
    description: 'Joue une tonalité ou carillon de confirmation sonore agréable.',
    iconName: 'BellRing',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Jouer son' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'soundType',
        label: 'Type de carillon',
        type: 'select',
        options: [
          { label: 'Validation / Succès (Ding)', value: 'success' },
          { label: 'Notification pop', value: 'pop' },
          { label: 'Clic subtil', value: 'click' },
        ],
        defaultValue: 'success',
      },
    ],
    defaultData: { label: 'Jouer son', soundType: 'success' },
  },
  {
    type: 'action_confetti',
    category: 'action',
    name: 'Lancer des confettis',
    description: 'Déclenche une pluie festive de confettis pour célébrer une action réussie.',
    iconName: 'Sparkles',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Lancer' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'durationSeconds',
        label: 'Durée (secondes)',
        type: 'number',
        defaultValue: 3,
      },
    ],
    defaultData: { label: 'Confettis festifs ! 🎉', durationSeconds: 3 },
  },
  {
    type: 'action_download_file',
    category: 'action',
    name: 'Télécharger un fichier',
    description: 'Génère ou télécharge un document (CSV, texte, JSON) pour le visiteur.',
    iconName: 'HardDriveDownload',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Télécharger' },
      { id: 'content_in', name: 'Contenu', type: 'data', dataType: 'any', label: 'Contenu fichier' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'fileName',
        label: 'Nom du fichier',
        type: 'text',
        defaultValue: 'export-donnees.csv',
      },
    ],
    defaultData: { label: 'Télécharger fichier', fileName: 'export-donnees.csv' },
  },
  {
    type: 'action_reload_page',
    category: 'action',
    name: 'Recharger la page',
    description: 'Rafraîchit la page Web actuelle du visiteur.',
    iconName: 'RotateCw',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Recharger' },
    ],
    outputs: [],
    fields: [],
    defaultData: { label: 'Recharger la page' },
  },
  {
    type: 'action_history_back',
    category: 'action',
    name: 'Page précédente (Retour historique)',
    description: 'Renvoie le visiteur sur la page précédente consultée.',
    iconName: 'FileSymlink',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Retour' },
    ],
    outputs: [],
    fields: [],
    defaultData: { label: 'Retour page précédente' },
  },
  {
    type: 'action_localstorage_set',
    category: 'action',
    name: 'Sauvegarder dans LocalStorage',
    description: 'Enregistre une information de façon persistante sur le navigateur du visiteur.',
    iconName: 'HardDriveUpload',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Sauvegarder' },
      { id: 'value_in', name: 'Valeur', type: 'data', dataType: 'any', label: 'Valeur à stocker' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'storageKey',
        label: 'Clé de stockage (Nom)',
        type: 'text',
        defaultValue: 'preferences_utilisateur',
      },
    ],
    defaultData: { label: 'Sauvegarde LocalStorage', storageKey: 'preferences_utilisateur' },
  },
  {
    type: 'action_localstorage_get',
    category: 'action',
    name: 'Lire depuis LocalStorage',
    description: 'Récupère une donnée persistée dans le stockage local du navigateur.',
    iconName: 'HardDriveDownload',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Lire' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
      { id: 'value_out', name: 'Valeur', type: 'data', dataType: 'any', label: 'Valeur lue' },
    ],
    fields: [
      {
        key: 'storageKey',
        label: 'Clé de stockage',
        type: 'text',
        defaultValue: 'preferences_utilisateur',
      },
    ],
    defaultData: { label: 'Lecture LocalStorage', storageKey: 'preferences_utilisateur' },
  },
  {
    type: 'action_set_document_title',
    category: 'action',
    name: 'Modifier le titre de l’onglet',
    description: 'Change dynamiquement le texte de l’onglet du navigateur (ex: "Nouveau message !").',
    iconName: 'Type',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Changer' },
      { id: 'title_in', name: 'Titre', type: 'data', dataType: 'text', label: 'Titre dynamique' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'newTitle',
        label: 'Nouveau titre d’onglet',
        type: 'text',
        defaultValue: 'Notification importante',
      },
    ],
    defaultData: { label: 'Titre de l’onglet', newTitle: 'Notification importante' },
  },
  {
    type: 'action_toggle_dark_mode',
    category: 'action',
    name: 'Basculer Mode Sombre / Clair',
    description: 'Alterne le thème d’affichage entre Mode Sombre et Mode Clair.',
    iconName: 'Palette',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Basculer' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
      { id: 'is_dark', name: 'Est Sombre', type: 'data', dataType: 'boolean', label: 'État thème' },
    ],
    fields: [],
    defaultData: { label: 'Basculer Dark Mode' },
  },

  // ==========================================
  // 3. LOGIQUE (Violet)
  // ==========================================
  {
    type: 'logic_if_else',
    category: 'logic',
    name: 'Si… alors… sinon',
    description: 'Aiguille le chemin d’exécution selon qu’une condition soit Vraie ou Fausse.',
    iconName: 'GitBranch',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'condition_in', name: 'Condition', type: 'data', dataType: 'boolean', label: 'Vrai ou Faux' },
    ],
    outputs: [
      { id: 'flow_true', name: 'Si VRAI', type: 'flow', label: 'Si VRAI (Oui)' },
      { id: 'flow_false', name: 'Si FAUX', type: 'flow', label: 'Si FAUX (Non)' },
    ],
    fields: [],
    defaultData: { label: 'Si… alors… sinon' },
  },
  {
    type: 'logic_compare',
    category: 'logic',
    name: 'Comparer deux valeurs',
    description: 'Compare deux éléments (égal, supérieur, inférieur, contient).',
    iconName: 'Scale',
    inputs: [
      { id: 'value_a', name: 'Valeur A', type: 'data', dataType: 'any', label: 'Première valeur' },
      { id: 'value_b', name: 'Valeur B', type: 'data', dataType: 'any', label: 'Seconde valeur' },
    ],
    outputs: [
      { id: 'result_bool', name: 'Résultat', type: 'data', dataType: 'boolean', label: 'Est vérifié (Vrai/Faux)' },
    ],
    fields: [
      {
        key: 'operator',
        label: 'Opérateur de comparaison',
        type: 'select',
        options: [
          { label: 'Est égal à ( = )', value: '==' },
          { label: 'Est différent de ( ≠ )', value: '!=' },
          { label: 'Est supérieur à ( > )', value: '>' },
          { label: 'Est supérieur ou égal ( ≥ )', value: '>=' },
          { label: 'Est inférieur à ( < )', value: '<' },
          { label: 'Est inférieur ou égal ( ≤ )', value: '<=' },
          { label: 'Contient le texte', value: 'contains' },
        ],
        defaultValue: '==',
      },
    ],
    defaultData: { label: 'Comparer', operator: '==' },
  },
  {
    type: 'logic_boolean_op',
    category: 'logic',
    name: 'Et / Ou / Non',
    description: 'Combine ou inverse plusieurs conditions booléennes.',
    iconName: 'Network',
    inputs: [
      { id: 'input_a', name: 'Condition A', type: 'data', dataType: 'boolean', label: 'Condition 1' },
      { id: 'input_b', name: 'Condition B', type: 'data', dataType: 'boolean', label: 'Condition 2' },
    ],
    outputs: [
      { id: 'result_bool', name: 'Résultat', type: 'data', dataType: 'boolean', label: 'Résultat combiné' },
    ],
    fields: [
      {
        key: 'operator',
        label: 'Opération logique',
        type: 'select',
        options: [
          { label: 'ET (les deux conditions doivent être vraies)', value: 'AND' },
          { label: 'OU (au moins une condition doit être vraie)', value: 'OR' },
          { label: 'NON (inverser la condition A)', value: 'NOT' },
        ],
        defaultValue: 'AND',
      },
    ],
    defaultData: { label: 'Et / Ou / Non', operator: 'AND' },
  },
  {
    type: 'logic_delay',
    category: 'logic',
    name: 'Attendre',
    description: 'Fait une pause de quelques secondes avant de passer à l’action suivante.',
    iconName: 'Hourglass',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'seconds_in', name: 'Délai', type: 'data', dataType: 'number', label: 'Durée en secondes' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Après l’attente' },
    ],
    fields: [
      {
        key: 'seconds',
        label: 'Durée d’attente (secondes)',
        type: 'number',
        defaultValue: 1,
        tooltip: 'Temps de pause en secondes (ex: 1.5).',
      },
    ],
    defaultData: { label: 'Attendre 1s', seconds: 1 },
  },
  {
    type: 'logic_repeat',
    category: 'logic',
    name: 'Répéter N fois',
    description: 'Répète un groupe d’actions un nombre précis de fois.',
    iconName: 'RotateCw',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'count_in', name: 'Nombre', type: 'data', dataType: 'number', label: 'Nombre de fois' },
    ],
    outputs: [
      { id: 'flow_loop', name: 'Boucle', type: 'flow', label: 'Chaque tour' },
      { id: 'flow_done', name: 'Terminé', type: 'flow', label: 'Une fois fini' },
      { id: 'current_index', name: 'Numéro tour', type: 'data', dataType: 'number', label: 'Tour actuel (1, 2…)' },
    ],
    fields: [
      {
        key: 'iterations',
        label: 'Nombre de répétitions',
        type: 'number',
        defaultValue: 3,
      },
    ],
    defaultData: { label: 'Répéter 3 fois', iterations: 3 },
  },
  {
    type: 'logic_for_each',
    category: 'logic',
    name: 'Pour chaque élément d’une liste',
    description: 'Parcourt tour à tour chaque élément d’une liste ou collection.',
    iconName: 'ListOrdered',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'list_in', name: 'Liste', type: 'data', dataType: 'list', label: 'Liste à parcourir' },
    ],
    outputs: [
      { id: 'flow_item', name: 'Pour chaque', type: 'flow', label: 'Chaque élément' },
      { id: 'flow_done', name: 'Terminé', type: 'flow', label: 'Après la liste' },
      { id: 'current_item', name: 'Élément', type: 'data', dataType: 'any', label: 'Valeur courante' },
      { id: 'current_index', name: 'Position', type: 'data', dataType: 'number', label: 'Index (0, 1…)' },
    ],
    fields: [],
    defaultData: { label: 'Pour chaque élément' },
  },
  {
    type: 'logic_switch',
    category: 'logic',
    name: 'Aiguilleur multi-cas (Switch)',
    description: 'Aiguille le flux selon plusieurs valeurs possibles (Cas 1, Cas 2, Par défaut).',
    iconName: 'GitBranch',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'value_in', name: 'Valeur testée', type: 'data', dataType: 'any', label: 'Valeur à comparer' },
    ],
    outputs: [
      { id: 'case_1', name: 'Cas A', type: 'flow', label: 'Si égal à A' },
      { id: 'case_2', name: 'Cas B', type: 'flow', label: 'Si égal à B' },
      { id: 'default_out', name: 'Par défaut', type: 'flow', label: 'Sinon (Autre)' },
    ],
    fields: [
      {
        key: 'caseA',
        label: 'Valeur pour Cas A',
        type: 'text',
        defaultValue: 'oui',
      },
      {
        key: 'caseB',
        label: 'Valeur pour Cas B',
        type: 'text',
        defaultValue: 'non',
      },
    ],
    defaultData: { label: 'Aiguilleur (Switch)', caseA: 'oui', caseB: 'non' },
  },
  {
    type: 'logic_debounce',
    category: 'logic',
    name: 'Anti-rebond (Debounce)',
    description: 'Retarde l’exécution pour attendre que l’utilisateur ait fini de taper (parfait pour la recherche en direct).',
    iconName: 'Hourglass',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Signal' },
      { id: 'data_in', name: 'Donnée', type: 'data', dataType: 'any', label: 'Donnée transmise' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Signal stabilisé' },
      { id: 'data_out', name: 'Donnée', type: 'data', dataType: 'any', label: 'Donnée stabilisée' },
    ],
    fields: [
      {
        key: 'delayMs',
        label: 'Délai d’attente (millisecondes)',
        type: 'number',
        defaultValue: 300,
        tooltip: '300ms est idéal pour une barre de recherche fluide.',
      },
    ],
    defaultData: { label: 'Anti-rebond (300ms)', delayMs: 300 },
  },
  {
    type: 'logic_random',
    category: 'logic',
    name: 'Générateur Aléatoire',
    description: 'Tire un nombre au sort ou un choix aléatoire entre deux bornes Min et Max.',
    iconName: 'Calculator',
    inputs: [
      { id: 'flow_in', name: 'Générer', type: 'flow', label: 'Tirer au sort' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
      { id: 'number_out', name: 'Nombre tiré', type: 'data', dataType: 'number', label: 'Nombre aléatoire' },
    ],
    fields: [
      {
        key: 'min',
        label: 'Valeur minimale',
        type: 'number',
        defaultValue: 1,
      },
      {
        key: 'max',
        label: 'Valeur maximale',
        type: 'number',
        defaultValue: 100,
      },
    ],
    defaultData: { label: 'Tirage aléatoire (1-100)', min: 1, max: 100 },
  },
  {
    type: 'logic_text_transform',
    category: 'logic',
    name: 'Transformer du texte',
    description: 'Nettoie, met en majuscules/minuscules, tronque ou concatène du texte.',
    iconName: 'Pilcrow',
    inputs: [
      { id: 'text_in', name: 'Texte d’entrée', type: 'data', dataType: 'text', label: 'Texte source' },
    ],
    outputs: [
      { id: 'text_out', name: 'Texte transformé', type: 'data', dataType: 'text', label: 'Texte modifié' },
    ],
    fields: [
      {
        key: 'operation',
        label: 'Transformation',
        type: 'select',
        options: [
          { label: 'MAJUSCULES (Uppercase)', value: 'uppercase' },
          { label: 'minuscules (lowercase)', value: 'lowercase' },
          { label: 'Nettoyer espaces (Trim)', value: 'trim' },
          { label: 'Longueur du texte (Nombre de lettres)', value: 'length' },
        ],
        defaultValue: 'uppercase',
      },
    ],
    defaultData: { label: 'Transformer texte', operation: 'uppercase' },
  },
  {
    type: 'logic_ai_generate',
    category: 'logic',
    name: 'Intelligence Artificielle (Génération)',
    description: 'Génère, résume ou traduit instantanément un texte avec l’intelligence artificielle.',
    iconName: 'Sparkles',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Générer' },
      { id: 'prompt_in', name: 'Consigne / Contexte', type: 'data', dataType: 'text', label: 'Texte à traiter' },
    ],
    outputs: [
      { id: 'flow_success', name: 'Succès', type: 'flow', label: 'Quand réponse reçue' },
      { id: 'flow_error', name: 'Erreur', type: 'flow', label: 'En cas d’erreur' },
      { id: 'result_out', name: 'Réponse IA', type: 'data', dataType: 'text', label: 'Texte généré' },
    ],
    fields: [
      {
        key: 'systemPrompt',
        label: 'Consigne pour l’IA',
        type: 'text',
        defaultValue: 'Résume ce texte en une phrase concise et percutante.',
      },
    ],
    defaultData: { label: 'IA Générative', systemPrompt: 'Résume ce texte en une phrase.' },
  },

  // ==========================================
  // 4. DONNÉES (Vert)
  // ==========================================
  {
    type: 'data_create_memory',
    category: 'data',
    name: 'Créer une mémoire',
    description: 'Déclare une nouvelle variable pour stocker une valeur dans le projet.',
    iconName: 'Variable',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Initialiser' },
      { id: 'initial_val', name: 'Valeur initiale', type: 'data', dataType: 'any', label: 'Départ' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
      { id: 'mem_val_out', name: 'Valeur', type: 'data', dataType: 'any', label: 'Valeur créée' },
    ],
    fields: [
      {
        key: 'memoryName',
        label: 'Nom de la variable',
        type: 'text',
        placeholder: 'Ex: CompteurClics',
        defaultValue: 'MaVariable',
      },
      {
        key: 'memoryType',
        label: 'Type de données',
        type: 'select',
        options: [
          { label: 'Texte', value: 'text' },
          { label: 'Nombre', value: 'number' },
          { label: 'Vrai/Faux (Booléen)', value: 'boolean' },
          { label: 'Liste', value: 'list' },
        ],
        defaultValue: 'number',
      },
    ],
    defaultData: { label: 'Créer mémoire', memoryName: 'MaVariable', memoryType: 'number' },
  },
  {
    type: 'data_get_memory',
    category: 'data',
    name: 'Lire une mémoire',
    description: 'Récupère la valeur actuelle d’une variable enregistrée.',
    iconName: 'HardDriveDownload',
    inputs: [],
    outputs: [
      { id: 'value_out', name: 'Valeur', type: 'data', dataType: 'any', label: 'Valeur lue' },
    ],
    fields: [
      {
        key: 'memoryId',
        label: 'Mémoire à lire',
        type: 'memoryPicker',
        tooltip: 'Choisissez la mémoire dont vous voulez lire la valeur.',
      },
    ],
    defaultData: { label: 'Lire mémoire', memoryId: '' },
  },
  {
    type: 'data_set_memory',
    category: 'data',
    name: 'Modifier une mémoire',
    description: 'Remplace la valeur d’une variable existante par une nouvelle valeur.',
    iconName: 'HardDriveUpload',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'new_val_in', name: 'Nouvelle valeur', type: 'data', dataType: 'any', label: 'Valeur à écrire' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
      { id: 'val_written', name: 'Valeur écrite', type: 'data', dataType: 'any', label: 'Nouvelle valeur' },
    ],
    fields: [
      {
        key: 'memoryId',
        label: 'Mémoire à modifier',
        type: 'memoryPicker',
      },
    ],
    defaultData: { label: 'Modifier mémoire', memoryId: '' },
  },
  {
    type: 'data_get_field_value',
    category: 'data',
    name: 'Valeur d’un champ',
    description: 'Lit en temps réel ce qui est écrit ou coché dans un champ de la page.',
    iconName: 'ScanLine',
    inputs: [],
    outputs: [
      { id: 'field_value', name: 'Contenu', type: 'data', dataType: 'any', label: 'Texte ou valeur saisie' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Champ de saisie',
        type: 'elementPicker',
        tooltip: 'Choisissez le champ ou formulaire.',
      },
    ],
    defaultData: { label: 'Valeur du champ', targetElementId: '' },
  },
  {
    type: 'data_read_collection',
    category: 'data',
    name: 'Lire une collection',
    description: 'Récupère toutes les données ou lignes d’une collection enregistrée.',
    iconName: 'Layers2',
    inputs: [],
    outputs: [
      { id: 'items_list', name: 'Toutes les lignes', type: 'data', dataType: 'list', label: 'Liste des lignes' },
      { id: 'count_out', name: 'Total lignes', type: 'data', dataType: 'number', label: 'Nombre de lignes' },
    ],
    fields: [
      {
        key: 'collectionId',
        label: 'Collection à lire',
        type: 'collectionPicker',
      },
    ],
    defaultData: { label: 'Lire collection', collectionId: '' },
  },
  {
    type: 'data_create_entry',
    category: 'data',
    name: 'Ajouter dans une collection',
    description: 'Crée et insère une nouvelle ligne/entrée dans une collection CMS.',
    iconName: 'PlusSquare',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Ajouter' },
      { id: 'entry_data_in', name: 'Données', type: 'data', dataType: 'any', label: 'Données de la ligne' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Après ajout' },
      { id: 'created_entry', name: 'Entrée créée', type: 'data', dataType: 'any', label: 'Ligne ajoutée' },
    ],
    fields: [
      {
        key: 'collectionId',
        label: 'Collection cible',
        type: 'collectionPicker',
      },
      {
        key: 'entryJson',
        label: 'Valeurs par défaut (JSON ou texte)',
        type: 'text',
        placeholder: '{"nom": "Nouveau", "prix": 29}',
      },
    ],
    defaultData: { label: 'Ajouter dans collection', collectionId: '', entryJson: '' },
  },
  {
    type: 'data_constant_text',
    category: 'data',
    name: 'Texte fixe',
    description: 'Définit une chaîne de caractères fixe sans code.',
    iconName: 'Pilcrow',
    inputs: [],
    outputs: [
      { id: 'text_out', name: 'Texte', type: 'data', dataType: 'text', label: 'Texte fixe' },
    ],
    fields: [
      {
        key: 'value',
        label: 'Texte fixe',
        type: 'text',
        defaultValue: 'Bonjour le monde !',
      },
    ],
    defaultData: { label: 'Texte fixe', value: 'Bonjour le monde !' },
  },
  {
    type: 'data_constant_number',
    category: 'data',
    name: 'Nombre fixe',
    description: 'Définit une valeur numérique constante (ex: 1, 10, 42).',
    iconName: 'Binary',
    inputs: [],
    outputs: [
      { id: 'number_out', name: 'Nombre', type: 'data', dataType: 'number', label: 'Nombre' },
    ],
    fields: [
      {
        key: 'value',
        label: 'Nombre',
        type: 'number',
        defaultValue: 1,
      },
    ],
    defaultData: { label: 'Nombre fixe (1)', value: 1 },
  },
  {
    type: 'data_constant_boolean',
    category: 'data',
    name: 'Oui / Non (Vrai/Faux)',
    description: 'Définit une valeur booléenne fixe (Vrai ou Faux).',
    iconName: 'ToggleRight',
    inputs: [],
    outputs: [
      { id: 'bool_out', name: 'Booléen', type: 'data', dataType: 'boolean', label: 'Vrai ou Faux' },
    ],
    fields: [
      {
        key: 'value',
        label: 'Valeur',
        type: 'boolean',
        defaultValue: true,
      },
    ],
    defaultData: { label: 'Vrai (Oui)', value: true },
  },

  // ==========================================
  // 5. OUTILS (Gris)
  // ==========================================
  {
    type: 'tool_math',
    category: 'tool',
    name: 'Calcul mathématique',
    description: 'Effectue des opérations simples : + − × ÷ modulo, arrondi, nombre aléatoire.',
    iconName: 'Calculator',
    inputs: [
      { id: 'num_a', name: 'Nombre A', type: 'data', dataType: 'number', label: 'Premier nombre' },
      { id: 'num_b', name: 'Nombre B', type: 'data', dataType: 'number', label: 'Second nombre' },
    ],
    outputs: [
      { id: 'result_num', name: 'Résultat', type: 'data', dataType: 'number', label: 'Résultat calculé' },
    ],
    fields: [
      {
        key: 'operation',
        label: 'Opération',
        type: 'select',
        options: [
          { label: 'Addition ( + )', value: 'add' },
          { label: 'Soustraction ( − )', value: 'sub' },
          { label: 'Multiplication ( × )', value: 'mul' },
          { label: 'Division ( ÷ )', value: 'div' },
          { label: 'Arrondi à l’entier', value: 'round' },
          { label: 'Nombre Aléatoire entre 1 et N', value: 'random' },
        ],
        defaultValue: 'add',
      },
    ],
    defaultData: { label: 'Calcul (A + B)', operation: 'add' },
  },
  {
    type: 'tool_text',
    category: 'tool',
    name: 'Outil Texte',
    description: 'Assemble plusieurs morceaux de texte, passe en MAJUSCULES ou compte les lettres.',
    iconName: 'FileText',
    inputs: [
      { id: 'text_a', name: 'Texte A', type: 'data', dataType: 'text', label: 'Premier morceau' },
      { id: 'text_b', name: 'Texte B', type: 'data', dataType: 'text', label: 'Second morceau' },
    ],
    outputs: [
      { id: 'result_text', name: 'Résultat texte', type: 'data', dataType: 'text', label: 'Texte transformé' },
      { id: 'length_out', name: 'Longueur', type: 'data', dataType: 'number', label: 'Nombre de caractères' },
    ],
    fields: [
      {
        key: 'textAction',
        label: 'Action sur le texte',
        type: 'select',
        options: [
          { label: 'Assembler (Texte A + Texte B)', value: 'join' },
          { label: 'Convertir en MAJUSCULES', value: 'uppercase' },
          { label: 'Convertir en minuscules', value: 'lowercase' },
          { label: 'Compter les caractères', value: 'length' },
        ],
        defaultValue: 'join',
      },
    ],
    defaultData: { label: 'Assembler textes', textAction: 'join' },
  },
  {
    type: 'tool_date_time',
    category: 'tool',
    name: 'Date et Heure',
    description: 'Fournit la date du jour, l’heure actuelle ou formate une date.',
    iconName: 'CalendarClock',
    inputs: [],
    outputs: [
      { id: 'date_str', name: 'Date texte', type: 'data', dataType: 'text', label: 'Ex: 23/09/2026' },
      { id: 'time_str', name: 'Heure texte', type: 'data', dataType: 'text', label: 'Ex: 14:30' },
      { id: 'timestamp', name: 'Nombre secondes', type: 'data', dataType: 'number', label: 'Horodatage' },
    ],
    fields: [],
    defaultData: { label: 'Date et Heure actuelles' },
  },
  {
    type: 'tool_console_log',
    category: 'tool',
    name: 'Note Journal / Test',
    description: 'Enregistre une information dans le journal d’exécution pour tester votre logique.',
    iconName: 'Terminal',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'data_in', name: 'Donnée', type: 'data', dataType: 'any', label: 'Donnée à inspecter' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'note',
        label: 'Texte du message',
        type: 'text',
        defaultValue: 'Vérification du flux...',
      },
    ],
    defaultData: { label: 'Journal de test', note: 'Vérification du flux...' },
  },

  // ==========================================
  // 6. ORGANISATION & DOCUMENTATION
  // ==========================================
  {
    type: 'comment_sticky',
    category: 'comment',
    name: 'Note / Mémo',
    description: 'Ajoute un post-it coloré sur le graphe pour documenter le fonctionnement.',
    iconName: 'StickyNote',
    inputs: [],
    outputs: [],
    fields: [
      {
        key: 'commentText',
        label: 'Votre note explicative',
        type: 'text',
        defaultValue: 'Expliquez ici ce que fait cette partie de la logique...',
      },
      {
        key: 'colorTheme',
        label: 'Couleur de la note',
        type: 'select',
        options: [
          { label: 'Jaune classique', value: 'yellow' },
          { label: 'Vert menthe', value: 'green' },
          { label: 'Bleu doux', value: 'blue' },
          { label: 'Rose pastel', value: 'pink' },
        ],
        defaultValue: 'yellow',
      },
    ],
    defaultData: { label: 'Note explicative', commentText: 'Expliquez ici ce que fait cette logique...', colorTheme: 'yellow' },
  },

  // ==========================================
  // 7. CONNECTEURS API & SERVICES EXTERNES
  // ==========================================
  {
    type: 'action_stripe_checkout',
    category: 'action',
    name: 'Stripe Checkout',
    description: 'Redirige le client vers une page de paiement sécurisée Stripe.',
    iconName: 'CreditCard',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Payer' },
      { id: 'amount_in', name: 'Montant', type: 'data', dataType: 'number', label: 'Prix (€)' },
    ],
    outputs: [
      { id: 'flow_success', name: 'Succès', type: 'flow', label: 'Paiement Validé' },
      { id: 'flow_cancel', name: 'Annulé', type: 'flow', label: 'Paiement Annulé' },
    ],
    fields: [
      {
        key: 'productName',
        label: 'Nom du Produit',
        type: 'text',
        defaultValue: 'Abonnement Premium',
      },
      {
        key: 'amount',
        label: 'Prix par défaut (€)',
        type: 'number',
        defaultValue: 29,
      },
    ],
    defaultData: { label: 'Stripe Checkout', productName: 'Abonnement Premium', amount: 29 },
  },
  {
    type: 'action_airtable_fetch',
    category: 'action',
    name: 'Airtable Sync / Fetch',
    description: 'Récupère les enregistrements d’une table Airtable vers votre site.',
    iconName: 'Table',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Charger' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Données reçues' },
      { id: 'records_out', name: 'Données', type: 'data', dataType: 'list', label: 'Liste fiches' },
    ],
    fields: [
      {
        key: 'tableName',
        label: 'Nom de la Table Airtable',
        type: 'text',
        defaultValue: 'Clients',
      },
    ],
    defaultData: { label: 'Airtable Sync', tableName: 'Clients' },
  },
  {
    type: 'action_supabase_query',
    category: 'action',
    name: 'Supabase Query',
    description: 'Interroge une table PostgreSQL Supabase et renvoie les résultats.',
    iconName: 'Database',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Rechercher' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Résultats' },
      { id: 'data_out', name: 'Données', type: 'data', dataType: 'list', label: 'Résultats SQL' },
    ],
    fields: [
      {
        key: 'tableName',
        label: 'Table Supabase',
        type: 'text',
        defaultValue: 'users',
      },
    ],
    defaultData: { label: 'Supabase Query', tableName: 'users' },
  },
  {
    type: 'action_googlesheets_append',
    category: 'action',
    name: 'Google Sheets Append',
    description: 'Ajoute une nouvelle ligne dans votre fichier Google Sheets.',
    iconName: 'FileSpreadsheet',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Ajouter' },
      { id: 'data_in', name: 'Donnée', type: 'data', dataType: 'any', label: 'Champs formulaire' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ligne ajoutée' },
    ],
    fields: [
      {
        key: 'sheetName',
        label: 'Nom de l’onglet',
        type: 'text',
        defaultValue: 'Feuille1',
      },
    ],
    defaultData: { label: 'Google Sheets Append', sheetName: 'Feuille1' },
  },
  {
    type: 'group_frame',
    category: 'group',
    name: 'Cadre de groupe',
    description: 'Encadre visuellement plusieurs briques logiques qui fonctionnent ensemble.',
    iconName: 'BoxSelect',
    inputs: [],
    outputs: [],
    fields: [
      {
        key: 'groupTitle',
        label: 'Titre du groupe',
        type: 'text',
        defaultValue: 'Gestion de l’envoi du formulaire',
      },
    ],
    defaultData: { label: 'Groupe logique', groupTitle: 'Composant logique', width: 400, height: 300 },
  },

  // ==========================================
  // 8. LOGIQUE & EXPRESSIONS JAVASCRIPT AVANCÉES
  // ==========================================
  {
    type: 'js_script_custom',
    category: 'logic',
    name: 'Script JavaScript Personnalisé',
    description: 'Exécute un extrait de code JavaScript personnalisé avec entrées et valeurs de retour.',
    iconName: 'Terminal',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'input_a', name: 'Entrée A', type: 'data', dataType: 'any', label: 'Variable inputA' },
      { id: 'input_b', name: 'Entrée B', type: 'data', dataType: 'any', label: 'Variable inputB' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Succès' },
      { id: 'result_out', name: 'Résultat', type: 'data', dataType: 'any', label: 'Valeur retournée' },
      { id: 'error_out', name: 'Erreur', type: 'data', dataType: 'text', label: 'Message d’erreur' },
    ],
    fields: [
      {
        key: 'code',
        label: 'Code JavaScript (Utilisez return ...)',
        type: 'code',
        rows: 4,
        defaultValue: '// Ex: return (input_a || 0) * 2 + String(input_b || "");\nreturn (input_a || 0) + (input_b || 0);',
      },
    ],
    defaultData: { label: 'Script JS', code: 'return (input_a || 0) + (input_b || 0);' },
  },
  {
    type: 'js_array_filter',
    category: 'logic',
    name: 'Tableau JS : Filtrer (Array.filter)',
    description: 'Filtre les éléments d’une liste ou d’un tableau d’objets selon une condition JS.',
    iconName: 'ListOrdered',
    inputs: [
      { id: 'list_in', name: 'Tableau', type: 'data', dataType: 'list', label: 'Liste source' },
    ],
    outputs: [
      { id: 'filtered_list', name: 'Tableau filtré', type: 'data', dataType: 'list', label: 'Éléments conservés' },
      { id: 'count_out', name: 'Nombre', type: 'data', dataType: 'number', label: 'Taille' },
    ],
    fields: [
      {
        key: 'predicateCode',
        label: 'Condition de filtre (Ex: item.prix > 10)',
        type: 'code',
        rows: 2,
        defaultValue: 'item => Boolean(item)',
      },
    ],
    defaultData: { label: 'Array.filter()', predicateCode: 'item => Boolean(item)' },
  },
  {
    type: 'js_array_map',
    category: 'logic',
    name: 'Tableau JS : Transformer (Array.map)',
    description: 'Transforme chaque élément d’un tableau grâce à une fonction JavaScript.',
    iconName: 'ListOrdered',
    inputs: [
      { id: 'list_in', name: 'Tableau', type: 'data', dataType: 'list', label: 'Liste source' },
    ],
    outputs: [
      { id: 'mapped_list', name: 'Tableau transformé', type: 'data', dataType: 'list', label: 'Nouveau tableau' },
    ],
    fields: [
      {
        key: 'mapCode',
        label: 'Fonction de transformation (Ex: item => item.nom.toUpperCase())',
        type: 'code',
        rows: 2,
        defaultValue: 'item => typeof item === "object" ? item.title || item.name || item : String(item)',
      },
    ],
    defaultData: { label: 'Array.map()', mapCode: 'item => String(item)' },
  },
  {
    type: 'js_array_reduce',
    category: 'logic',
    name: 'Tableau JS : Accumuler / Somme (Array.reduce)',
    description: 'Calcule une somme, total ou objet accumulé à partir d’un tableau.',
    iconName: 'Calculator',
    inputs: [
      { id: 'list_in', name: 'Tableau', type: 'data', dataType: 'list', label: 'Liste source' },
      { id: 'initial_val', name: 'Valeur initiale', type: 'data', dataType: 'any', label: 'Départ (0, "")' },
    ],
    outputs: [
      { id: 'accumulator_out', name: 'Résultat accumulé', type: 'data', dataType: 'any', label: 'Total final' },
    ],
    fields: [
      {
        key: 'reducerCode',
        label: 'Code d’accumulation (Ex: (acc, item) => acc + (item.prix || 0))',
        type: 'code',
        rows: 2,
        defaultValue: '(acc, item) => acc + (Number(item) || 0)',
      },
    ],
    defaultData: { label: 'Array.reduce()', reducerCode: '(acc, item) => acc + (Number(item) || 0)' },
  },
  {
    type: 'js_array_methods',
    category: 'tool',
    name: 'Tableau JS : Opérations usuelles',
    description: 'Inversion, découpe (slice), recherche (find/includes), assemblage (join), tri (sort).',
    iconName: 'ListOrdered',
    inputs: [
      { id: 'list_in', name: 'Tableau', type: 'data', dataType: 'list', label: 'Liste d’entrée' },
      { id: 'param_in', name: 'Paramètre', type: 'data', dataType: 'any', label: 'Séparateur / Index' },
    ],
    outputs: [
      { id: 'result_out', name: 'Résultat', type: 'data', dataType: 'any', label: 'Résultat' },
      { id: 'length_out', name: 'Longueur', type: 'data', dataType: 'number', label: 'Taille du tableau' },
    ],
    fields: [
      {
        key: 'operation',
        label: 'Méthode JS',
        type: 'select',
        options: [
          { label: 'Assembler en texte (Array.join)', value: 'join' },
          { label: 'Inverser le tableau (Array.reverse)', value: 'reverse' },
          { label: 'Extraire une portion (Array.slice)', value: 'slice' },
          { label: 'Contient l’élément (Array.includes)', value: 'includes' },
          { label: 'Trier par ordre alphabétique (Array.sort)', value: 'sort' },
          { label: 'Longueur (Array.length)', value: 'length' },
        ],
        defaultValue: 'join',
      },
      {
        key: 'joinSeparator',
        label: 'Séparateur (si join)',
        type: 'text',
        defaultValue: ', ',
      },
    ],
    defaultData: { label: 'Tableau Opération', operation: 'join', joinSeparator: ', ' },
  },
  {
    type: 'js_json_parse',
    category: 'tool',
    name: 'JSON.parse() (Texte → Objet)',
    description: 'Convertit une chaîne de caractères JSON structurée en objet JavaScript manipulable.',
    iconName: 'Binary',
    inputs: [
      { id: 'json_str', name: 'Texte JSON', type: 'data', dataType: 'text', label: 'Chaîne JSON' },
    ],
    outputs: [
      { id: 'object_out', name: 'Objet JS', type: 'data', dataType: 'any', label: 'Objet ou Tableau' },
      { id: 'is_valid', name: 'Valide ?', type: 'data', dataType: 'boolean', label: 'Est JSON Valide' },
    ],
    fields: [],
    defaultData: { label: 'JSON.parse()' },
  },
  {
    type: 'js_json_stringify',
    category: 'tool',
    name: 'JSON.stringify() (Objet → Texte)',
    description: 'Convertit un objet ou tableau JavaScript en chaîne de caractères JSON.',
    iconName: 'Binary',
    inputs: [
      { id: 'object_in', name: 'Objet JS', type: 'data', dataType: 'any', label: 'Objet / Donnée' },
    ],
    outputs: [
      { id: 'json_str_out', name: 'Texte JSON', type: 'data', dataType: 'text', label: 'JSON formaté' },
    ],
    fields: [
      {
        key: 'pretty',
        label: 'Indenter le JSON (Pretty Print)',
        type: 'boolean',
        defaultValue: true,
      },
    ],
    defaultData: { label: 'JSON.stringify()', pretty: true },
  },
  {
    type: 'js_object_prop',
    category: 'tool',
    name: 'Objet JS : Lire / Écrire Propriété',
    description: 'Accède ou modifie une propriété dynamique dans un objet JavaScript (obj[key]).',
    iconName: 'Layers2',
    inputs: [
      { id: 'object_in', name: 'Objet', type: 'data', dataType: 'any', label: 'Objet source' },
      { id: 'prop_key_in', name: 'Clé', type: 'data', dataType: 'text', label: 'Nom de propriété' },
      { id: 'value_to_set', name: 'Nouvelle valeur', type: 'data', dataType: 'any', label: 'Valeur à écrire (si modification)' },
    ],
    outputs: [
      { id: 'value_out', name: 'Valeur lue', type: 'data', dataType: 'any', label: 'Contenu propriété' },
      { id: 'updated_obj_out', name: 'Objet modifié', type: 'data', dataType: 'any', label: 'Objet mis à jour' },
    ],
    fields: [
      {
        key: 'propertyName',
        label: 'Nom de la propriété (Clé)',
        type: 'text',
        placeholder: 'Ex: user.name ou id',
        defaultValue: 'id',
      },
    ],
    defaultData: { label: 'Lire / Écrire Propriété', propertyName: 'id' },
  },
  {
    type: 'js_object_keys_values',
    category: 'tool',
    name: 'Objet JS : Keys / Values / Entries',
    description: 'Extrait la liste des clés (Object.keys) ou valeurs (Object.values) d’un objet.',
    iconName: 'ListOrdered',
    inputs: [
      { id: 'object_in', name: 'Objet', type: 'data', dataType: 'any', label: 'Objet source' },
    ],
    outputs: [
      { id: 'keys_list', name: 'Clés (Keys)', type: 'data', dataType: 'list', label: 'Noms des clés' },
      { id: 'values_list', name: 'Valeurs (Values)', type: 'data', dataType: 'list', label: 'Liste des valeurs' },
    ],
    fields: [],
    defaultData: { label: 'Object.keys / values' },
  },
  {
    type: 'js_string_advanced',
    category: 'tool',
    name: 'Texte JS : String Replace / Split / Match',
    description: 'Remplacer (Replace), découper (Split), extraire (Substring) du texte avec la puissance de JS.',
    iconName: 'Pilcrow',
    inputs: [
      { id: 'text_in', name: 'Texte source', type: 'data', dataType: 'text', label: 'Texte initial' },
      { id: 'param1', name: 'Param 1', type: 'data', dataType: 'text', label: 'Recherche / Délimiteur' },
      { id: 'param2', name: 'Param 2', type: 'data', dataType: 'text', label: 'Remplacement' },
    ],
    outputs: [
      { id: 'text_out', name: 'Texte résultat', type: 'data', dataType: 'text', label: 'Texte modifié' },
      { id: 'list_out', name: 'Liste découpe', type: 'data', dataType: 'list', label: 'Tableau (si split)' },
    ],
    fields: [
      {
        key: 'operation',
        label: 'Opération JS',
        type: 'select',
        options: [
          { label: 'Remplacer (String.replace)', value: 'replace' },
          { label: 'Remplacer tout (String.replaceAll)', value: 'replaceAll' },
          { label: 'Découper en tableau (String.split)', value: 'split' },
          { label: 'Contient sous-chaîne (String.includes)', value: 'includes' },
          { label: 'Commence par (String.startsWith)', value: 'startsWith' },
          { label: 'Sous-chaîne (String.substring)', value: 'substring' },
        ],
        defaultValue: 'replace',
      },
    ],
    defaultData: { label: 'Texte JS Avancé', operation: 'replace' },
  },
  {
    type: 'js_regex',
    category: 'logic',
    name: 'Expression Régulière (RegExp)',
    description: 'Valide un format (email, téléphone, code postal) ou extrait des correspondances Regex.',
    iconName: 'Terminal',
    inputs: [
      { id: 'text_in', name: 'Texte à tester', type: 'data', dataType: 'text', label: 'Texte à analyser' },
    ],
    outputs: [
      { id: 'is_match', name: 'Est conforme ?', type: 'data', dataType: 'boolean', label: 'Vrai ou Faux' },
      { id: 'matches_list', name: 'Correspondances', type: 'data', dataType: 'list', label: 'Captures Regex' },
    ],
    fields: [
      {
        key: 'pattern',
        label: 'Motif Regex (Ex: ^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$)',
        type: 'text',
        defaultValue: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      },
      {
        key: 'flags',
        label: 'Options (flags: i, g, m)',
        type: 'text',
        defaultValue: 'i',
      },
    ],
    defaultData: { label: 'Regex Email', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', flags: 'i' },
  },
  {
    type: 'js_type_cast',
    category: 'tool',
    name: 'Conversion de Type JS (Cast)',
    description: 'Convertit explicitement entre String, Number, Boolean, parseInt, parseFloat.',
    iconName: 'Binary',
    inputs: [
      { id: 'val_in', name: 'Valeur', type: 'data', dataType: 'any', label: 'Donnée source' },
    ],
    outputs: [
      { id: 'val_out', name: 'Valeur convertie', type: 'data', dataType: 'any', label: 'Résultat converti' },
      { id: 'type_name', name: 'Type JS (typeof)', type: 'data', dataType: 'text', label: 'Nom du type JS' },
    ],
    fields: [
      {
        key: 'targetType',
        label: 'Type cible',
        type: 'select',
        options: [
          { label: 'Nombre entier (parseInt)', value: 'parseInt' },
          { label: 'Nombre décimal (parseFloat)', value: 'parseFloat' },
          { label: 'Texte (String)', value: 'String' },
          { label: 'Booléen (Boolean)', value: 'Boolean' },
          { label: 'Tableau (Array.from)', value: 'Array' },
        ],
        defaultValue: 'parseInt',
      },
    ],
    defaultData: { label: 'Conversion Type JS', targetType: 'parseInt' },
  },
  {
    type: 'js_ternary',
    category: 'logic',
    name: 'Opérateur Ternaire JS ( a ? b : c )',
    description: 'Renvoie la valeur B si la condition est vraie, sinon la valeur C.',
    iconName: 'GitBranch',
    inputs: [
      { id: 'condition_in', name: 'Condition', type: 'data', dataType: 'boolean', label: 'Vrai / Faux' },
      { id: 'true_val', name: 'Si Vrai', type: 'data', dataType: 'any', label: 'Valeur VRAIE' },
      { id: 'false_val', name: 'Si Faux', type: 'data', dataType: 'any', label: 'Valeur FAUSSE' },
    ],
    outputs: [
      { id: 'result_out', name: 'Résultat', type: 'data', dataType: 'any', label: 'Valeur choisie' },
    ],
    fields: [],
    defaultData: { label: 'Ternaire (a ? b : c)' },
  },
  {
    type: 'js_try_catch',
    category: 'logic',
    name: 'Try ... Catch JS (Gestion des Erreurs)',
    description: 'Tente d’exécuter une sous-partie. En cas de bogue ou d’erreur, bifurque vers la branche Catch sans faire planter l’application.',
    iconName: 'Terminal',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
    ],
    outputs: [
      { id: 'flow_try', name: 'Bloc Try', type: 'flow', label: 'Flux normal' },
      { id: 'flow_catch', name: 'Bloc Catch', type: 'flow', label: 'Si Erreur' },
      { id: 'error_msg', name: 'Détail Erreur', type: 'data', dataType: 'text', label: 'Code d’erreur' },
    ],
    fields: [],
    defaultData: { label: 'Try ... Catch JS' },
  },
  {
    type: 'js_console_log',
    category: 'tool',
    name: 'Console JS (console.log / warn / error / table)',
    description: 'Affiche des données détaillées dans les outils de développement du navigateur F12.',
    iconName: 'Terminal',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
      { id: 'data_in', name: 'Donnée', type: 'data', dataType: 'any', label: 'Valeur / Objet à afficher' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'level',
        label: 'Type de console',
        type: 'select',
        options: [
          { label: 'console.log (Message standard)', value: 'log' },
          { label: 'console.warn (Avertissement jaune)', value: 'warn' },
          { label: 'console.error (Erreur rouge)', value: 'error' },
          { label: 'console.table (Tableau structuré)', value: 'table' },
        ],
        defaultValue: 'log',
      },
    ],
    defaultData: { label: 'Console JS', level: 'log' },
  },
  {
    type: 'js_dom_class_toggle',
    category: 'action',
    name: 'DOM : Classe CSS (classList add / remove / toggle)',
    description: 'Ajoute, supprime ou bascule une classe CSS sur un élément HTML de la page.',
    iconName: 'Palette',
    inputs: [
      { id: 'flow_in', name: 'Entrée', type: 'flow', label: 'Exécuter' },
    ],
    outputs: [
      { id: 'flow_out', name: 'Sortie', type: 'flow', label: 'Ensuite' },
    ],
    fields: [
      {
        key: 'targetElementId',
        label: 'Élément HTML cible',
        type: 'elementPicker',
      },
      {
        key: 'className',
        label: 'Nom de la classe CSS',
        type: 'text',
        placeholder: 'Ex: active, bg-blue-500, hidden',
        defaultValue: 'active',
      },
      {
        key: 'action',
        label: 'Action classList',
        type: 'select',
        options: [
          { label: 'Alterner (Toggle)', value: 'toggle' },
          { label: 'Ajouter (Add)', value: 'add' },
          { label: 'Retirer (Remove)', value: 'remove' },
        ],
        defaultValue: 'toggle',
      },
    ],
    defaultData: { label: 'ClassList CSS', targetElementId: '', className: 'active', action: 'toggle' },
  },
  {
    type: 'js_url_query_params',
    category: 'data',
    name: 'URL Query Params (URLSearchParams)',
    description: 'Lit les paramètres d’URL (ex: ?promo=SUMMER2025 ou ?id=42).',
    iconName: 'ExternalLink',
    inputs: [],
    outputs: [
      { id: 'param_value', name: 'Valeur du paramètre', type: 'data', dataType: 'text', label: 'Valeur lue' },
      { id: 'has_param', name: 'Existe ?', type: 'data', dataType: 'boolean', label: 'Paramètre présent' },
    ],
    fields: [
      {
        key: 'paramKey',
        label: 'Nom du paramètre URL (?clé=...)',
        type: 'text',
        defaultValue: 'ref',
      },
    ],
    defaultData: { label: 'URL Query Param', paramKey: 'ref' },
  },
];

export function getNodeDefinition(type: string): LogicNodeDefinition | undefined {
  return LOGIC_CATALOG.find((def) => def.type === type);
}
