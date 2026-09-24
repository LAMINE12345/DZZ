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

    case 'navbar': {
      const links: Array<{ label: string; href: string }> = props.links || [
        { label: 'Accueil', href: '#' },
        { label: 'Services', href: '#services' },
        { label: 'Tarifs', href: '#tarifs' },
        { label: 'Contact', href: '#contact' },
      ];
      const logoHtml = props.brandLogoUrl
        ? `<img src="${escapeHtml(props.brandLogoUrl)}" alt="${escapeHtml(props.brandText || 'Logo')}" class="el-navbar-logo">`
        : `<span class="el-navbar-brand-text">${escapeHtml(props.brandText || 'MonStudio')}</span>`;
      const linksHtml = links
        .map((lnk) => `<a href="${escapeHtml(lnk.href || '#')}" class="el-navbar-link">${escapeHtml(lnk.label)}</a>`)
        .join('');
      const ctaHtml = props.ctaLabel
        ? `<a href="${escapeHtml(props.ctaHref || '#')}" class="el-button el-navbar-cta">${escapeHtml(props.ctaLabel)}</a>`
        : '';

      return `<nav id="${elId}" class="el-navbar"><div class="el-navbar-brand">${logoHtml}</div><div class="el-navbar-links">${linksHtml}</div>${ctaHtml}</nav>`;
    }

    case 'tabs': {
      const tabsList: Array<{ title: string; content: string }> = props.tabs || [
        { title: 'Onglet 1', content: 'Contenu du premier volet.' },
        { title: 'Onglet 2', content: 'Contenu du deuxième volet.' },
      ];
      const navButtons = tabsList
        .map((tItem, idx) => `<button type="button" class="el-tab-btn ${idx === 0 ? 'active' : ''}" data-tab-target="${elId}-tab-${idx}">${escapeHtml(tItem.title)}</button>`)
        .join('');
      const tabPanels = tabsList
        .map((tItem, idx) => `<div id="${elId}-tab-${idx}" class="el-tab-panel ${idx === 0 ? 'active' : ''}">${escapeHtml(tItem.content)}</div>`)
        .join('');

      return `<div id="${elId}" class="el-tabs-container"><div class="el-tabs-nav">${navButtons}</div><div class="el-tabs-content">${tabPanels}</div></div>`;
    }

    case 'rating': {
      const score = Number(props.score ?? 5);
      const maxScore = Number(props.maxScore ?? 5);
      const stars = '★'.repeat(Math.round(score)) + '☆'.repeat(Math.max(0, maxScore - Math.round(score)));
      const count = props.reviewCount ? `<span class="el-rating-count">(${escapeHtml(props.reviewCount)})</span>` : '';
      return `<div id="${elId}" class="el-rating"><span class="el-rating-stars">${stars}</span> <span class="el-rating-score">${score.toFixed(1)}/${maxScore}</span> ${count}</div>`;
    }

    case 'stat_kpi': {
      const trend = props.trend ? `<div class="el-stat-trend">↑ ${escapeHtml(props.trend)}</div>` : '';
      return `<div id="${elId}" class="el-stat-kpi"><div class="el-stat-label">${escapeHtml(props.label || 'KPI')}</div><div class="el-stat-value">${escapeHtml(props.value || '100%')}</div>${trend}</div>`;
    }

    case 'alert': {
      const variant = props.variant || 'info';
      const title = props.title ? `<strong class="el-alert-title">${escapeHtml(props.title)}</strong>` : '';
      return `<aside id="${elId}" class="el-alert el-alert-${escapeHtml(variant)}">${title}<p class="el-alert-msg">${escapeHtml(props.message || '')}</p></aside>`;
    }

    case 'video_embed': {
      const rawUrl = props.videoUrl || '';
      let embedUrl = rawUrl;
      if (rawUrl.includes('youtube.com/watch?v=')) {
        embedUrl = `https://www.youtube-nocookie.com/embed/${rawUrl.split('v=')[1]?.split('&')[0]}`;
      } else if (rawUrl.includes('youtu.be/')) {
        embedUrl = `https://www.youtube-nocookie.com/embed/${rawUrl.split('youtu.be/')[1]?.split('?')[0]}`;
      } else if (rawUrl.includes('vimeo.com/')) {
        embedUrl = `https://player.vimeo.com/video/${rawUrl.split('vimeo.com/')[1]?.split('?')[0]}`;
      }
      return `<div id="${elId}" class="el-video-embed-wrapper"><iframe src="${escapeHtml(embedUrl)}" class="el-video-embed" allowfullscreen loading="lazy"></iframe></div>`;
    }

    case 'carousel': {
      const images: Array<{ url: string; caption?: string }> = props.images || [];
      const slidesHtml = images
        .map((img, idx) => `<div class="el-carousel-slide ${idx === 0 ? 'active' : ''}"><img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.caption || 'Photo')}" loading="lazy">${img.caption ? `<div class="el-carousel-caption">${escapeHtml(img.caption)}</div>` : ''}</div>`)
        .join('');
      return `<div id="${elId}" class="el-carousel"><div class="el-carousel-slides">${slidesHtml}</div></div>`;
    }

    case 'textarea': {
      const label = props.label ? `<label class="el-label">${escapeHtml(props.label)}</label>` : '';
      const ph = props.placeholder || '';
      const rows = props.rows || 4;
      return `<div class="el-input-wrapper">${label}<textarea id="${elId}" rows="${rows}" placeholder="${escapeHtml(ph)}" class="el-textarea"></textarea></div>`;
    }

    case 'select': {
      const label = props.label ? `<label class="el-label">${escapeHtml(props.label)}</label>` : '';
      const options: string[] = props.options || [];
      const optsHtml = options.map((opt) => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('');
      return `<div class="el-input-wrapper">${label}<select id="${elId}" class="el-select">${optsHtml}</select></div>`;
    }

    case 'radio': {
      const label = props.label ? `<div class="el-label">${escapeHtml(props.label)}</div>` : '';
      const options: string[] = props.options || [];
      const radioHtml = options
        .map((opt, i) => `<label class="el-radio-item"><input type="radio" name="${escapeHtml(props.name || elId)}" value="${escapeHtml(opt)}" ${i === 0 ? 'checked' : ''}> <span>${escapeHtml(opt)}</span></label>`)
        .join('');
      return `<div class="el-radio-group">${label}${radioHtml}</div>`;
    }

    case 'switch': {
      const label = props.label || 'Interrupteur';
      const isChecked = props.checked ? ' checked' : '';
      return `<label class="el-switch-wrapper"><input id="${elId}" type="checkbox" class="el-switch-input"${isChecked}><span class="el-switch-slider"></span><span class="el-switch-label">${escapeHtml(label)}</span></label>`;
    }

    case 'range': {
      const label = props.label ? `<div class="el-label">${escapeHtml(props.label)} (${escapeHtml(String(props.value || 50))} ${escapeHtml(props.unit || '')})</div>` : '';
      return `<div class="el-range-wrapper">${label}<input id="${elId}" type="range" min="${props.min ?? 0}" max="${props.max ?? 100}" value="${props.value ?? 50}" class="el-range"></div>`;
    }

    case 'progress_bar': {
      const label = props.label ? `<div class="el-label">${escapeHtml(props.label)} (${props.value ?? 60}%)</div>` : '';
      const val = props.value ?? 60;
      const color = props.color || 'var(--primary)';
      return `<div id="${elId}" class="el-progress-wrapper">${label}<div class="el-progress-track"><div class="el-progress-fill" style="width: ${val}%; background-color: ${escapeHtml(color)};"></div></div></div>`;
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

.el-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-family: inherit;
  border: 1px solid #E6E6EE;
  border-radius: var(--radius);
  outline: none;
  background-color: var(--surface);
  resize: vertical;
}
.el-textarea:focus { border-color: var(--primary); }

.el-select {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  border: 1px solid #E6E6EE;
  border-radius: var(--radius);
  outline: none;
  background-color: var(--surface);
}

.el-radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.el-radio-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.el-switch-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  margin-bottom: 1rem;
}
.el-switch-input { display: none; }
.el-switch-slider {
  width: 44px;
  height: 24px;
  background-color: #E2E8F0;
  border-radius: 9999px;
  position: relative;
  transition: background-color 0.2s;
}
.el-switch-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
}
.el-switch-input:checked + .el-switch-slider { background-color: var(--primary); }
.el-switch-input:checked + .el-switch-slider::after { transform: translateX(20px); }
.el-switch-label { font-size: 0.9rem; font-weight: 600; }

.el-range-wrapper { margin-bottom: 1rem; width: 100%; }
.el-range { width: 100%; accent-color: var(--primary); }

.el-progress-wrapper { margin-bottom: 1rem; width: 100%; }
.el-progress-track {
  width: 100%;
  height: 10px;
  background-color: #E2E8F0;
  border-radius: 9999px;
  overflow: hidden;
}
.el-progress-fill { height: 100%; border-radius: 9999px; transition: width 0.3s ease; }

/* Navbar */
.el-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: var(--surface);
  border-radius: var(--radius);
  border: 1px solid #E6E6EE;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
}
.el-navbar-brand { font-size: 1.25rem; font-weight: 800; color: var(--text); }
.el-navbar-links { display: flex; align-items: center; gap: 1.5rem; }
.el-navbar-link { text-decoration: none; color: var(--text); font-size: 0.9rem; font-weight: 600; }
.el-navbar-link:hover { color: var(--primary); }

/* Tabs */
.el-tabs-container {
  background-color: var(--surface);
  border-radius: var(--radius);
  border: 1px solid #E6E6EE;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.el-tabs-nav {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #E6E6EE;
  margin-bottom: 1rem;
}
.el-tab-btn {
  padding: 0.6rem 1.2rem;
  font-weight: 700;
  font-size: 0.85rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  color: rgba(27, 27, 47, 0.6);
}
.el-tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
.el-tab-panel { display: none; font-size: 0.9rem; line-height: 1.6; }
.el-tab-panel.active { display: block; }

/* Rating */
.el-rating {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: var(--radius);
}
.el-rating-stars { color: #F59E0B; font-size: 1.1rem; }
.el-rating-score { font-weight: 700; font-size: 0.9rem; }
.el-rating-count { color: #6B7280; font-size: 0.8rem; }

/* KPI */
.el-stat-kpi {
  background-color: var(--surface);
  border: 1px solid #E6E6EE;
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.el-stat-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #8E8EA6; }
.el-stat-value { font-size: 2.2rem; font-weight: 800; color: var(--text); line-height: 1; }
.el-stat-trend { color: #10B981; font-weight: 700; font-size: 0.85rem; }

/* Alert */
.el-alert {
  padding: 1rem 1.25rem;
  border-radius: var(--radius);
  border: 1px solid;
  margin-bottom: 1rem;
}
.el-alert-title { display: block; margin-bottom: 0.25rem; font-size: 0.9rem; }
.el-alert-msg { font-size: 0.85rem; }
.el-alert-info { background: #EEF2FF; border-color: #C7D2FE; color: #3730A3; }
.el-alert-success { background: #ECFDF5; border-color: #A7F3D0; color: #065F46; }
.el-alert-warning { background: #FFFBEB; border-color: #FDE68A; color: #92400E; }
.el-alert-error { background: #FEF2F2; border-color: #FECACA; color: #991B1B; }

/* Video Embed & Carousel */
.el-video-embed-wrapper { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: var(--radius); margin: 1rem 0; }
.el-video-embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }

.el-carousel { position: relative; border-radius: var(--radius); overflow: hidden; margin: 1rem 0; }
.el-carousel-slides img { width: 100%; height: 350px; object-fit: cover; display: block; }
.el-carousel-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 1rem; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: white; font-weight: 600; font-size: 0.9rem; }

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
  var inputs = document.querySelectorAll('.el-input, .el-textarea');
  inputs.forEach(function(inp) {
    inp.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && inp.tagName !== 'TEXTAREA') {
        e.preventDefault();
        showToast('Données envoyées : ' + inp.value);
        inp.value = '';
      }
    });
  });

  // Gestion des Onglets (Tabs)
  var tabButtons = document.querySelectorAll('.el-tab-btn');
  tabButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var container = btn.closest('.el-tabs-container');
      if (!container) return;
      var targetId = btn.getAttribute('data-tab-target');
      
      container.querySelectorAll('.el-tab-btn').forEach(function(b) { b.classList.remove('active'); });
      container.querySelectorAll('.el-tab-panel').forEach(function(p) { p.classList.remove('active'); });
      
      btn.classList.add('active');
      var targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
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
