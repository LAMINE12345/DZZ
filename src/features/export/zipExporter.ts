import JSZip from 'jszip';
import { Project, Page, Element, Collection, ProjectTheme } from '@/src/core/types';

export interface ZipExportOptions {
  minify?: boolean;
  includeSeo?: boolean;
  projectName?: string;
}

export async function generateProjectZip(project: Project, options: ZipExportOptions = {}): Promise<Blob> {
  const zip = new JSZip();
  const minify = options.minify ?? false;

  // 1. Dossier CSS
  const cssFolder = zip.folder('css');
  const stylesCss = buildProjectCSS(project, minify);
  cssFolder?.file('styles.css', stylesCss);

  // 2. Dossier JS
  const jsFolder = zip.folder('js');
  const appJs = buildProjectJS(project, minify);
  jsFolder?.file('app.js', appJs);

  // 3. Dossier Assets (Fichiers médias)
  const assetsFolder = zip.folder('assets');
  assetsFolder?.file('README.txt', 'Placez ici vos images et vidéos personnalisées.\n');

  // 4. Fichiers HTML par Page
  project.pages.forEach((page) => {
    const filename = page.isHome || page.slug === 'index' || page.slug === 'accueil' ? 'index.html' : `${page.slug}.html`;
    const htmlContent = buildPageHTML(page, project, minify);
    zip.file(filename, htmlContent);
  });

  // 5. Documentation README.md
  const readmeContent = `# ${project.name}

Site web statique généré avec **Atelier - Constructeur de Sites & App-Builder**.

## 🚀 Mise en ligne rapide

1. **Test local** : Ouvrez simplement le fichier \`index.html\` dans votre navigateur web préféré.
2. **Netlify** : Glissez-déposez l'intégralité de ce dossier décompressé sur [app.netlify.com/drop](https://app.netlify.com/drop).
3. **Vercel** : Déployez le dossier avec la commande \`vercel\` dans votre terminal.
4. **GitHub Pages** : Glissez les fichiers sur la branche \`gh-pages\` ou \`main\` de votre dépôt.

## 📂 Structure du projet

- \`index.html\` : Page d'accueil principale
- \`css/styles.css\` : Feuilles de styles compilées et optimisées
- \`js/app.js\` : Moteur d'interactivité et de logique (Zero dépendance)
- \`assets/\` : Dossier pour vos images et ressources
`;
  zip.file('README.md', readmeContent);

  // Génération de l'archive ZIP
  return await zip.generateAsync({ type: 'blob' });
}

// ==========================================
// COMPILATION HTML POUR UNE PAGE
// ==========================================
function buildPageHTML(page: Page, project: Project, minify: boolean): string {
  const theme = project.theme;
  const pageTitle = page.seo?.title || `${page.name} – ${project.name}`;
  const pageDesc = page.seo?.description || project.description || `Découvrez ${page.name} sur ${project.name}.`;
  const ogImage = page.seo?.ogImage || 'https://picsum.photos/seed/atelier-share/1200/630';
  const faviconUrl = page.seo?.favicon || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✨</text></svg>';
  const schemaType = page.seo?.schemaType || 'WebApplication';

  const bodyHtml = renderElementToHTML(page.root, page, project);

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: pageTitle,
    description: pageDesc,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
  };

  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(pageDesc)}">
  <link rel="icon" href="${escapeHtml(faviconUrl)}">

  <!-- OpenGraph Social Cards -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(pageDesc)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(pageDesc)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
    ${JSON.stringify(jsonLdData, null, 2)}
  </script>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">

  <!-- Styles compilés -->
  <link rel="stylesheet" href="css/styles.css">
</head>
<body data-page-id="${page.id}">
  <!-- Navigation Header entre les pages -->
  <header class="atelier-site-header">
    <div class="header-container">
      <a href="index.html" class="site-brand">${escapeHtml(project.name)}</a>
      <nav class="site-nav">
        ${project.pages
          .map((p) => {
            const href = p.isHome || p.slug === 'index' ? 'index.html' : `${p.slug}.html`;
            const isActive = p.id === page.id ? 'active' : '';
            return `<a href="${href}" class="nav-link ${isActive}">${escapeHtml(p.name)}</a>`;
          })
          .join('\n        ')}
      </nav>
    </div>
  </header>

  <!-- Contenu Principal de la page -->
  <main class="page-content">
    ${bodyHtml}
  </main>

  <!-- Script d'interactivité autonome (JS Vanille) -->
  <script src="js/app.js" defer></script>
</body>
</html>`;

  if (minify) {
    html = html.replace(/>\s+</g, '><').trim();
  }

  return html;
}

function renderElementToHTML(element: Element, page: Page, project: Project): string {
  if (element.hidden) return '';

  const elId = element.id;
  const tag = element.type;
  const props = element.props || {};

  switch (tag) {
    case 'heading': {
      const headingTag = props.tag || 'h2';
      return `<${headingTag} id="${elId}" class="el-heading">${escapeHtml(props.text || 'Titre')}</${headingTag}>`;
    }

    case 'text': {
      const textTag = props.tag || 'p';
      return `<${textTag} id="${elId}" class="el-text">${escapeHtml(props.text || '')}</${textTag}>`;
    }

    case 'link': {
      const href = props.href || '#';
      const target = props.target || '_self';
      return `<a id="${elId}" href="${escapeHtml(href)}" target="${target}" class="el-link">${escapeHtml(props.text || 'Lien')}</a>`;
    }

    case 'divider': {
      return `<hr id="${elId}" class="el-divider">`;
    }

    case 'blockquote': {
      const cite = props.author ? `<cite class="el-cite">— ${escapeHtml(props.author)}</cite>` : '';
      return `<blockquote id="${elId}" class="el-blockquote"><p>${escapeHtml(props.quote || '')}</p>${cite}</blockquote>`;
    }

    case 'code_block': {
      const lang = props.language || 'code';
      return `<pre id="${elId}" class="el-code-block"><code class="language-${escapeHtml(lang)}">${escapeHtml(props.code || '')}</code></pre>`;
    }

    case 'table': {
      const headers: string[] = props.headers || [];
      const rows: string[][] = props.rows || [];
      const headHtml = headers.length > 0 ? `<thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>` : '';
      const bodyHtml = `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
      return `<div class="el-table-wrapper"><table id="${elId}" class="el-table">${headHtml}${bodyHtml}</table></div>`;
    }

    case 'accordion': {
      const summary = props.summary || 'En savoir plus';
      const content = props.content || '';
      const openAttr = props.isOpenDefault ? ' open' : '';
      return `<details id="${elId}" class="el-accordion"${openAttr}><summary class="el-summary">${escapeHtml(summary)}</summary><div class="el-accordion-content">${escapeHtml(content)}</div></details>`;
    }

    case 'audio': {
      const audioUrl = props.audioUrl || '';
      const controls = props.controls !== false ? ' controls' : '';
      const autoplay = props.autoplay ? ' autoplay' : '';
      const loop = props.loop ? ' loop' : '';
      return `<audio id="${elId}" src="${escapeHtml(audioUrl)}" class="el-audio"${controls}${autoplay}${loop}></audio>`;
    }

    case 'iframe': {
      const src = props.src || '';
      const title = props.title || 'Cadre externe';
      return `<iframe id="${elId}" src="${escapeHtml(src)}" title="${escapeHtml(title)}" class="el-iframe" loading="lazy"></iframe>`;
    }

    case 'custom_html': {
      return `<div id="${elId}" class="el-custom-html">${props.htmlCode || ''}</div>`;
    }

    case 'badge': {
      return `<span id="${elId}" class="el-badge">${escapeHtml(props.text || 'Badge')}</span>`;
    }

    case 'button': {
      const label = props.label || props.text || 'Bouton';
      const linkUrl = props.linkUrl || '#';
      const target = props.openInNewTab ? '_blank' : '_self';
      return `<a id="${elId}" href="${escapeHtml(linkUrl)}" target="${target}" class="el-button">${escapeHtml(label)}</a>`;
    }

    case 'image': {
      const src = props.src || 'https://picsum.photos/800/400';
      const alt = props.alt || 'Image';
      return `<img id="${elId}" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="el-image" loading="lazy">`;
    }

    case 'video': {
      const videoUrl = props.videoUrl || '';
      const poster = props.poster ? ` poster="${escapeHtml(props.poster)}"` : '';
      return `<video id="${elId}" src="${escapeHtml(videoUrl)}"${poster} controls class="el-video"></video>`;
    }

    case 'form': {
      const childrenHtml = (element.children || [])
        .map((child: Element) => renderElementToHTML(child, page, project))
        .join('\n');
      return `<form id="${elId}" class="el-form">${childrenHtml}</form>`;
    }

    case 'input': {
      const inputLabel = props.label ? `<label class="el-label">${escapeHtml(props.label)}</label>` : '';
      const ph = props.placeholder || '';
      return `<div class="el-input-wrapper">${inputLabel}<input id="${elId}" type="text" placeholder="${escapeHtml(ph)}" class="el-input"></div>`;
    }

    case 'checkbox': {
      const label = props.label || 'Case à cocher';
      return `<label class="el-checkbox-wrapper"><input id="${elId}" type="checkbox" class="el-checkbox"> <span>${escapeHtml(label)}</span></label>`;
    }

    case 'list': {
      const items: string[] = props.items || ['Élément 1', 'Élément 2', 'Élément 3'];
      return `<ul id="${elId}" class="el-list">${items.map((it) => `<li>✓ ${escapeHtml(it)}</li>`).join('')}</ul>`;
    }

    case 'section':
    case 'box':
    case 'columns': {
      const containerTag = props.tag || (tag === 'section' ? 'section' : 'div');
      const childrenHtml = (element.children || [])
        .map((child: Element) => renderElementToHTML(child, page, project))
        .join('\n');
      return `<${containerTag} id="${elId}" class="el-container el-type-${tag}">${childrenHtml}</${containerTag}>`;
    }

    default: {
      const childrenHtml = (element.children || [])
        .map((child: Element) => renderElementToHTML(child, page, project))
        .join('\n');

      return `<div id="${elId}" class="el-container el-type-${tag}">${childrenHtml}</div>`;
    }
  }
}

// ==========================================
// COMPILATION CSS COMPLÈTE DU PROJET
// ==========================================
function buildProjectCSS(project: Project, minify: boolean): string {
  const theme = (project.theme || {}) as Partial<ProjectTheme>;
  const primary = theme.primaryColor || '#5B5BF0';
  const accent = theme.accentColor || '#14B8A6';
  const bg = theme.backgroundColor || '#F7F7FA';
  const surface = theme.surfaceColor || '#FFFFFF';
  const text = theme.textColor || '#1B1B2F';
  const headingFont = theme.headingFont || 'Plus Jakarta Sans, sans-serif';
  const bodyFont = theme.bodyFont || 'Inter, sans-serif';
  const radius = `${theme.radius ?? 12}px`;
  const btnRadius = `${theme.buttonRadius ?? 12}px`;

  let css = `:root {
  --primary: ${primary};
  --accent: ${accent};
  --bg: ${bg};
  --surface: ${surface};
  --text: ${text};
  --heading-font: '${headingFont}', sans-serif;
  --body-font: '${bodyFont}', sans-serif;
  --radius: ${radius};
  --btn-radius: ${btnRadius};
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--body-font);
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-col;
}

/* Header de Navigation */
.atelier-site-header {
  background-color: var(--surface);
  border-bottom: 1px solid rgba(0,0,0,0.08);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-brand {
  font-family: var(--heading-font);
  font-weight: 800;
  font-size: 1.25rem;
  color: var(--primary);
  text-decoration: none;
}

.site-nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  text-decoration: none;
  color: var(--text);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.nav-link:hover, .nav-link.active {
  background-color: rgba(91, 91, 240, 0.1);
  color: var(--primary);
}

.page-content {
  max-width: 1200px;
  width: 100%;
  margin: 2rem auto;
  padding: 0 1.5rem;
  flex: 1;
}

/* Styles des Blocs Individuels */
.el-heading {
  font-family: var(--heading-font);
  font-weight: 800;
  color: var(--text);
  margin-bottom: 1rem;
}

h1.el-heading { font-size: 2.5rem; }
h2.el-heading { font-size: 2rem; }
h3.el-heading { font-size: 1.5rem; }

.el-text {
  font-size: 1rem;
  color: rgba(27, 27, 47, 0.85);
  margin-bottom: 1rem;
}

.el-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  border-radius: var(--btn-radius);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(91, 91, 240, 0.25);
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.el-button:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

.el-image {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius);
  display: block;
  margin: 1rem 0;
}

.el-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
  width: 100%;
}

.el-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}

.el-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  border: 1px solid #E6E6EE;
  border-radius: var(--radius);
  outline: none;
  background-color: var(--surface);
  transition: border-color 0.2s ease;
}

.el-input:focus {
  border-color: var(--primary);
}

.el-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

/* Notification Toast Système */
.atelier-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #10B981;
  color: white;
  padding: 12px 20px;
  border-radius: var(--radius);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  font-weight: 600;
  font-size: 0.9rem;
  z-index: 9999;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 768px) {
  .header-container { flex-direction: column; gap: 0.8rem; }
  h1.el-heading { font-size: 1.8rem; }
}
`;

  if (minify) {
    css = css.replace(/\s+/g, ' ').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  }

  return css;
}

// ==========================================
// COMPILATION JS COMPLÈTE DU PROJET (VANILLA)
// ==========================================
function buildProjectJS(project: Project, minify: boolean): string {
  let js = `// Moteur d'interactivité autonome - ${project.name}
document.addEventListener('DOMContentLoaded', function() {
  console.log('Site ${escapeHtml(project.name)} chargé avec succès.');

  // Gestion des clics sur boutons et formulaires
  var buttons = document.querySelectorAll('.el-button');
  buttons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var href = btn.getAttribute('href');
      if (href && href !== '#') {
        return; // Navigation standard
      }
      e.preventDefault();
      showToast('Action effectuée !');
    });
  });

  // Gestion des formulaires
  var inputs = document.querySelectorAll('.el-input');
  inputs.forEach(function(inp) {
    inp.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        showToast('Données envoyées : ' + inp.value);
        inp.value = '';
      }
    });
  });

  // Helper Toast Notification
  function showToast(message) {
    var existing = document.querySelector('.atelier-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'atelier-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
  }
});
`;

  if (minify) {
    js = js.replace(/\/\/.*/g, '').replace(/\s+/g, ' ').trim();
  }

  return js;
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
