'use client';

import * as React from 'react';
import { Element, ViewportMode } from '@/src/core/types';
import { useAppStore } from '@/src/core/store';
import { FloatingMiniToolbar } from './FloatingMiniToolbar';
import { ELEMENT_DEFINITIONS } from './editorElements';
import {
  Sparkles,
  Check,
  Play,
  CheckCircle2,
  HelpCircle,
  Square,
  ShieldCheck,
  Zap,
  Globe,
  Heart,
  Star,
  Mail,
  Phone,
  ArrowRight,
  Database,
  Tag,
  Move,
  Quote,
  Code,
  Table as TableIcon,
  Volume2,
  Link2,
  Minus,
  Copy,
} from 'lucide-react';

const iconCatalog: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Heart,
  Star,
  Mail,
  Phone,
  ArrowRight,
  HelpCircle,
  Square,
  Tag,
  Quote,
  Code,
  Table: TableIcon,
  Volume2,
  Link2,
  Minus,
};

interface ElementRendererProps {
  element: Element;
  parent?: Element | null;
  onContextMenu: (e: React.MouseEvent, elementId: string) => void;
}

export function applyItemDataBindings(node: Element, item: Record<string, any>, collectionName = ''): Element {
  const newProps = { ...node.props };

  if (node.bindings) {
    Object.entries(node.bindings).forEach(([propKey, expr]) => {
      const exprStr = typeof expr === 'string' ? expr : String(expr || '');
      const cleanExpr = exprStr.replace(/^(item\.|[a-zA-Z0-9_-]+\.)/, '');
      const val = item[cleanExpr] !== undefined ? item[cleanExpr] : item[exprStr];
      if (val !== undefined && val !== null) {
        if (cleanExpr === 'prix' && typeof val === 'number') {
          newProps[propKey] = `${val} €`;
        } else {
          newProps[propKey] = val;
        }
      }
    });
  }

  const newChildren = (node.children || []).map((child: Element) =>
    applyItemDataBindings(child, item, collectionName)
  );

  return {
    ...node,
    id: `${node.id}-${item.id || Math.random().toString(36).substring(2, 6)}`,
    props: newProps,
    children: newChildren,
  };
}

export function ElementRenderer({ element, parent, onContextMenu }: ElementRendererProps) {
  const {
    project,
    selectedElementId,
    selectedElementIds,
    selectElement,
    inlineEditingId,
    setInlineEditingId,
    updateElementProps,
    updateElementStyle,
    viewportMode,
    draggedElementType,
    dropIndicator,
    setDropIndicator,
    insertElementToActivePage,
    zoom,
    pushSnapshot,
    addToast,
    reorderElementInTree,
  } = useAppStore();

  const isSelected = selectedElementId === element.id || selectedElementIds.includes(element.id);
  const isPrimarySelected = selectedElementId === element.id;
  const isEditing = inlineEditingId === element.id;

  // Référence du conteneur pour redimensionnement et déplacement
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [resizingInfo, setResizingInfo] = React.useState<{ width: number; height: number } | null>(null);
  const [movingInfo, setMovingInfo] = React.useState<{ x: number; y: number } | null>(null);

  // Récupération des styles fusionnés selon le viewport
  const styleDesktop = element.style?.desktop || {};
  const styleTablet = element.style?.tablet || {};
  const styleMobile = element.style?.mobile || {};

  const effectiveStyle: React.CSSProperties = {
    ...styleDesktop,
    ...(viewportMode === 'tablet' || viewportMode === 'mobile' ? styleTablet : {}),
    ...(viewportMode === 'mobile' ? styleMobile : {}),
  };

  const isAbsolute = effectiveStyle.position === 'absolute';

  // Gestion du redimensionnement interactif via les 8 poignées
  const handleResizeStart = (direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (element.locked) return;

    const elNode = wrapperRef.current;
    if (!elNode) return;

    const rect = elNode.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const currentZoom = zoom || 1;
    const startWidth = Math.round(rect.width / currentZoom);
    const startHeight = Math.round(rect.height / currentZoom);

    const parentNode = elNode.parentElement;
    const parentRect = parentNode?.getBoundingClientRect() || { left: 0, top: 0 };
    const startLeft = typeof effectiveStyle.left === 'number'
      ? effectiveStyle.left
      : parseInt(String(effectiveStyle.left || ''), 10) || Math.round((rect.left - parentRect.left) / currentZoom);
    const startTop = typeof effectiveStyle.top === 'number'
      ? effectiveStyle.top
      : parseInt(String(effectiveStyle.top || ''), 10) || Math.round((rect.top - parentRect.top) / currentZoom);

    let finalW = startWidth;
    let finalH = startHeight;
    let finalL = startLeft;
    let finalT = startTop;

    const onMouseMove = (moveEvt: MouseEvent) => {
      moveEvt.preventDefault();
      const dx = (moveEvt.clientX - startX) / currentZoom;
      const dy = (moveEvt.clientY - startY) / currentZoom;

      let w = startWidth;
      let h = startHeight;
      let l = startLeft;
      let t = startTop;

      if (direction.includes('e')) {
        w = Math.max(28, Math.round(startWidth + dx));
      }
      if (direction.includes('w')) {
        w = Math.max(28, Math.round(startWidth - dx));
        if (isAbsolute) {
          l = Math.round(startLeft + (startWidth - w));
        }
      }
      if (direction.includes('s')) {
        h = Math.max(20, Math.round(startHeight + dy));
      }
      if (direction.includes('n')) {
        h = Math.max(20, Math.round(startHeight - dy));
        if (isAbsolute) {
          t = Math.round(startTop + (startHeight - h));
        }
      }

      finalW = w;
      finalH = h;
      finalL = l;
      finalT = t;

      setResizingInfo({ width: w, height: h });
      if (elNode) {
        elNode.style.width = `${w}px`;
        elNode.style.height = `${h}px`;
        if (isAbsolute && direction.includes('w')) {
          elNode.style.left = `${l}px`;
        }
        if (isAbsolute && direction.includes('n')) {
          elNode.style.top = `${t}px`;
        }
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setResizingInfo(null);

      pushSnapshot();
      const updates: Record<string, any> = {
        width: `${finalW}px`,
        height: `${finalH}px`,
      };
      if (isAbsolute) {
        if (direction.includes('w')) updates.left = `${finalL}px`;
        if (direction.includes('n')) updates.top = `${finalT}px`;
      }
      updateElementStyle(element.id, updates, viewportMode);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Déplacement libre à la souris (style Canva / Figma)
  const handleFreeMoveStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (element.locked) return;

    const elNode = wrapperRef.current;
    if (!elNode) return;

    const rect = elNode.getBoundingClientRect();
    const parentNode = elNode.parentElement;
    const parentRect = parentNode?.getBoundingClientRect() || { left: 0, top: 0 };
    const currentZoom = zoom || 1;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;

    const startLeft = isAbsolute && typeof effectiveStyle.left === 'number'
      ? effectiveStyle.left
      : isAbsolute && typeof effectiveStyle.left === 'string' && !isNaN(parseInt(effectiveStyle.left, 10))
      ? parseInt(effectiveStyle.left, 10)
      : Math.max(0, Math.round((rect.left - parentRect.left) / currentZoom));

    const startTop = isAbsolute && typeof effectiveStyle.top === 'number'
      ? effectiveStyle.top
      : isAbsolute && typeof effectiveStyle.top === 'string' && !isNaN(parseInt(effectiveStyle.top, 10))
      ? parseInt(effectiveStyle.top, 10)
      : Math.max(0, Math.round((rect.top - parentRect.top) / currentZoom));

    let finalLeft = startLeft;
    let finalTop = startTop;

    const onMouseMove = (moveEvt: MouseEvent) => {
      moveEvt.preventDefault();
      const dx = (moveEvt.clientX - startMouseX) / currentZoom;
      const dy = (moveEvt.clientY - startMouseY) / currentZoom;

      finalLeft = Math.round(startLeft + dx);
      finalTop = Math.round(startTop + dy);

      setMovingInfo({ x: finalLeft, y: finalTop });

      if (elNode) {
        elNode.style.position = 'absolute';
        elNode.style.left = `${finalLeft}px`;
        elNode.style.top = `${finalTop}px`;
        elNode.style.zIndex = '40';
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setMovingInfo(null);

      pushSnapshot();
      updateElementStyle(
        element.id,
        {
          position: 'absolute',
          left: `${finalLeft}px`,
          top: `${finalTop}px`,
          zIndex: effectiveStyle.zIndex || 10,
        },
        viewportMode
      );
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Récupération de la traduction i18n dynamique
  const i18nConfig = project.i18n;
  const isI18nActive = i18nConfig?.enabled && i18nConfig.activeLocale && i18nConfig.activeLocale !== i18nConfig.defaultLocale;
  const elementTranslations = isI18nActive ? i18nConfig.translations?.[i18nConfig.activeLocale]?.[element.id] : null;

  const getTranslatedProp = (key: string, fallback: string) => {
    if (elementTranslations && elementTranslations[key]) {
      return elementTranslations[key];
    }
    return fallback;
  };

  // Application des polices et styles du thème par défaut
  if (!effectiveStyle.fontFamily) {
    if (element.type === 'heading') {
      effectiveStyle.fontFamily = project.theme?.headingFont || 'Plus Jakarta Sans';
    } else {
      effectiveStyle.fontFamily = project.theme?.bodyFont || 'Inter';
    }
  }

  // Application de l'animation d'apparition si configurée
  if (element.props?.animationType && element.props.animationType !== 'none') {
    effectiveStyle.animationDelay = element.props?.animationDelay || '0s';
    effectiveStyle.animationDuration = element.props?.animationDuration || '0.5s';
    effectiveStyle.animationFillMode = 'both';
  }

  const getAnimationClass = () => {
    switch (element.props?.animationType) {
      case 'fade-in':
        return 'animate-in fade-in';
      case 'slide-up':
        return 'animate-in fade-in slide-in-from-bottom-6';
      case 'slide-left':
        return 'animate-in fade-in slide-in-from-left-6';
      case 'zoom-in':
        return 'animate-in fade-in zoom-in-95';
      case 'bounce':
        return 'animate-bounce';
      default:
        return '';
    }
  };

  // Gestion du double clic pour édition de texte
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.locked) return;
    if (['heading', 'text', 'button', 'input', 'checkbox', 'badge', 'link', 'blockquote'].includes(element.type)) {
      setInlineEditingId(element.id);
    }
  };

  // Gestion du clic pour sélection
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id, e.ctrlKey || e.metaKey || e.shiftKey);
    if (isEditing && inlineEditingId !== element.id) {
      setInlineEditingId(null);
    }
  };

  // Gestion du Drag-over et de l'indicateur d'insertion bleu
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const height = rect.height;

    if (element.type === 'section' || element.type === 'box' || element.type === 'columns') {
      if (relY < 15) {
        setDropIndicator({ targetParentId: parent?.id || element.id, index: 0, position: 'before' });
      } else if (relY > height - 15) {
        setDropIndicator({
          targetParentId: parent?.id || element.id,
          index: (element.children?.length || 0),
          position: 'after',
        });
      } else {
        setDropIndicator({
          targetParentId: element.id,
          index: (element.children?.length || 0),
          position: 'inside',
        });
      }
    } else if (parent) {
      if (relY < height / 2) {
        setDropIndicator({ targetParentId: parent.id, index: 0, position: 'before' });
      } else {
        setDropIndicator({ targetParentId: parent.id, index: 999, position: 'after' });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Déplacement / réordonnancement d'un élément existant
    const reorderId = e.dataTransfer.getData('text/reorder-element-id');
    if (reorderId && reorderId !== element.id) {
      const targetParent =
        element.type === 'section' || element.type === 'box' || element.type === 'columns'
          ? element.id
          : parent?.id || element.id;
      reorderElementInTree(reorderId, targetParent, dropIndicator?.index ?? undefined);
      addToast({
        type: 'success',
        title: 'Élément déplacé',
        message: "L'élément a été repositionné avec succès.",
      });
      setDropIndicator(null);
      return;
    }

    // 2. Ajout d'un nouvel élément depuis la bibliothèque
    const type = e.dataTransfer.getData('text/plain') || draggedElementType;
    if (type) {
      const targetParent =
        element.type === 'section' || element.type === 'box' || element.type === 'columns'
          ? element.id
          : parent?.id || element.id;
      
      const elDef = ELEMENT_DEFINITIONS.find((d) => d.type === type);
      if (elDef) {
        const newEl = elDef.createElement();
        insertElementToActivePage(newEl, targetParent);
      }
    }
    setDropIndicator(null);
  };

  if (element.hidden) {
    return null;
  }

  // Rendu spécifique du corps de chaque type d'élément
  const renderContent = () => {
    switch (element.type) {
      // === TITRE (H1 - H6) ===
      case 'heading': {
        const Tag = (element.props?.tag || 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        if (isEditing) {
          return (
            <input
              type="text"
              value={element.props?.text || ''}
              onChange={(e) => updateElementProps(element.id, { text: e.target.value })}
              onBlur={() => setInlineEditingId(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setInlineEditingId(null);
              }}
              autoFocus
              className="w-full bg-white/80 dark:bg-[#181824]/80 p-1 border-2 border-[#5B5BF0] rounded-md outline-none"
              style={effectiveStyle}
            />
          );
        }
        return (
          <Tag style={effectiveStyle} className={`outline-none ${getAnimationClass()}`}>
            {getTranslatedProp('props.text', getTranslatedProp('content', element.props?.text || 'Titre de niveau'))}
          </Tag>
        );
      }

      // === PARAGRAPHE DE TEXTE (<p>, <span>, <small>, <strong>, etc.) ===
      case 'text': {
        const TextTag = (element.props?.tag || 'p') as any;
        if (isEditing) {
          return (
            <textarea
              value={element.props?.text || ''}
              onChange={(e) => updateElementProps(element.id, { text: e.target.value })}
              onBlur={() => setInlineEditingId(null)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setInlineEditingId(null);
              }}
              autoFocus
              rows={3}
              className="w-full bg-white/80 dark:bg-[#181824]/80 p-1 border-2 border-[#5B5BF0] rounded-md outline-none resize-y"
              style={effectiveStyle}
            />
          );
        }
        return (
          <TextTag style={effectiveStyle} className={`whitespace-pre-wrap outline-none ${getAnimationClass()}`}>
            {getTranslatedProp('props.text', getTranslatedProp('content', element.props?.text || 'Votre texte explicatif ici…'))}
          </TextTag>
        );
      }

      // === LIEN HYPERTEXTE (<a>) ===
      case 'link': {
        if (isEditing) {
          return (
            <input
              type="text"
              value={element.props?.text || ''}
              onChange={(e) => updateElementProps(element.id, { text: e.target.value })}
              onBlur={() => setInlineEditingId(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setInlineEditingId(null);
              }}
              autoFocus
              className="bg-white text-black p-1 border-2 border-[#5B5BF0] rounded-md outline-none"
            />
          );
        }
        return (
          <a
            href={element.props?.href || '#'}
            target={element.props?.target || '_self'}
            style={effectiveStyle}
            className={`outline-none hover:opacity-80 transition-opacity ${getAnimationClass()}`}
            onClick={(e) => e.preventDefault()}
          >
            {getTranslatedProp('props.text', element.props?.text || 'Lien hypertexte')}
          </a>
        );
      }

      // === SÉPARATEUR HORIZONTAL (<hr>) ===
      case 'divider': {
        return (
          <hr
            style={effectiveStyle}
            className={`border-0 ${getAnimationClass()}`}
          />
        );
      }

      // === CITATION (<blockquote>) ===
      case 'blockquote': {
        if (isEditing) {
          return (
            <textarea
              value={element.props?.quote || ''}
              onChange={(e) => updateElementProps(element.id, { quote: e.target.value })}
              onBlur={() => setInlineEditingId(null)}
              autoFocus
              className="w-full bg-white text-black p-1 border-2 border-[#5B5BF0] rounded-md outline-none"
            />
          );
        }
        return (
          <blockquote style={effectiveStyle} className={`outline-none ${getAnimationClass()}`}>
            <p className="mb-2">{element.props?.quote || 'Citation inspirante…'}</p>
            {element.props?.author && (
              <cite className="block text-xs font-semibold text-[#8E8EA6] not-italic">
                — {element.props.author}
              </cite>
            )}
          </blockquote>
        );
      }

      // === BALISE HTML PERSONNALISÉE / CODE BRUT (<custom_html>) ===
      case 'custom_html': {
        const rawHtml = element.props?.htmlCode || '<div class="p-3 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">Balise HTML active</div>';
        return (
          <div
            style={effectiveStyle}
            className={`overflow-hidden ${getAnimationClass()}`}
            dangerouslySetInnerHTML={{ __html: rawHtml }}
          />
        );
      }

      // === BLOC DE CODE (<pre><code>) ===
      case 'code_block': {
        return (
          <div style={effectiveStyle} className={`relative group/code ${getAnimationClass()}`}>
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-[10px] text-gray-400 font-mono">
              <span>{element.props?.language || 'code'}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(element.props?.code || '');
                  addToast({ type: 'success', title: 'Code copié' });
                }}
                className="hover:text-white p-1"
                title="Copier le code"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <pre className="overflow-x-auto">
              <code className="text-xs font-mono">{element.props?.code || '// Code source'}</code>
            </pre>
          </div>
        );
      }

      // === TABLEAU HTML (<table>) ===
      case 'table': {
        const headers: string[] = element.props?.headers || ['Col 1', 'Col 2', 'Col 3'];
        const rows: string[][] = element.props?.rows || [
          ['Donnée 1', 'Donnée 2', 'Donnée 3'],
          ['Valeur A', 'Valeur B', 'Valeur C'],
        ];

        return (
          <div style={effectiveStyle} className={`overflow-x-auto ${getAnimationClass()}`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F7FA] dark:bg-[#1E1E2E] border-b border-[#E6E6EE] dark:border-[#28283C]">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="p-3 font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E6EE] dark:divide-[#28283C]">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-black/2 dark:hover:bg-white/2">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 text-[#62627A] dark:text-[#A5A5BC]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // === ACCORDÉON / DÉTAILS (<details><summary>) ===
      case 'accordion': {
        return (
          <details
            open={element.props?.isOpenDefault}
            style={effectiveStyle}
            className={`cursor-pointer group ${getAnimationClass()}`}
          >
            <summary className="font-bold text-xs text-[#1B1B2F] dark:text-[#F4F4F9] list-none flex items-center justify-between">
              <span>{element.props?.summary || 'Question ou Titre accordéon'}</span>
              <span className="text-[#8E8EA6] group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 text-xs text-[#62627A] dark:text-[#A5A5BC] pt-2 border-t border-black/5 dark:border-white/5">
              {element.props?.content || 'Contenu détaillé révélé lors du clic.'}
            </div>
          </details>
        );
      }

      // === LECTEUR AUDIO (<audio>) ===
      case 'audio': {
        return (
          <div style={effectiveStyle} className={getAnimationClass()}>
            <audio
              src={element.props?.audioUrl}
              controls={element.props?.controls ?? true}
              autoPlay={element.props?.autoplay ?? false}
              loop={element.props?.loop ?? false}
              className="w-full"
            />
          </div>
        );
      }

      // === IFRAME (<iframe>) ===
      case 'iframe': {
        return (
          <div style={effectiveStyle} className={`relative overflow-hidden ${getAnimationClass()}`}>
            <iframe
              src={element.props?.src || 'https://www.openstreetmap.org/export/embed.html'}
              title={element.props?.title || 'Contenu externe'}
              className="w-full h-full border-0 pointer-events-none select-none"
            />
          </div>
        );
      }

      // === BOUTON (<button>) ===
      case 'button': {
        const buttonStyle: React.CSSProperties = {
          backgroundColor: effectiveStyle.backgroundColor || project.theme?.primaryColor || '#5B5BF0',
          borderRadius: effectiveStyle.borderRadius || `${project.theme?.buttonRadius ?? 12}px`,
          fontFamily: effectiveStyle.fontFamily || project.theme?.bodyFont || 'Inter',
          ...effectiveStyle,
        };

        if (isEditing) {
          return (
            <input
              type="text"
              value={element.props?.label || ''}
              onChange={(e) => updateElementProps(element.id, { label: e.target.value })}
              onBlur={() => setInlineEditingId(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setInlineEditingId(null);
              }}
              autoFocus
              className="bg-white text-black p-1 border-2 border-[#5B5BF0] rounded-md outline-none font-semibold text-center"
            />
          );
        }
        return (
          <button
            type="button"
            style={buttonStyle}
            className={`transition-transform active:scale-98 select-none ${getAnimationClass()}`}
          >
            {getTranslatedProp('props.label', getTranslatedProp('content', element.props?.label || 'Bouton d’action'))}
          </button>
        );
      }

      // === IMAGE (<img>) ===
      case 'image': {
        return (
          <img
            src={element.props?.src || 'https://picsum.photos/seed/atelier/800/400'}
            alt={element.props?.alt || 'Image de présentation'}
            style={effectiveStyle}
            className={`pointer-events-none select-none max-w-full ${getAnimationClass()}`}
          />
        );
      }

      // === VIDÉO (<video>) ===
      case 'video': {
        return (
          <div style={effectiveStyle} className={`relative flex items-center justify-center bg-black/90 ${getAnimationClass()}`}>
            <video
              src={element.props?.videoUrl}
              poster={element.props?.poster}
              controls={element.props?.controls ?? true}
              className="w-full h-full object-cover"
            />
          </div>
        );
      }

      // === ICÔNE (<svg>) ===
      case 'icon': {
        const IconComponent = iconCatalog[element.props?.iconName] || Sparkles;
        const iconSize = element.props?.size || 24;
        return (
          <div style={effectiveStyle} className={`select-none ${getAnimationClass()}`}>
            <IconComponent style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
          </div>
        );
      }

      // === FORME ===
      case 'shape': {
        return <div style={effectiveStyle} className={getAnimationClass()} />;
      }

      // === SECTION & CADRE & COLONNES (Conteneurs Sémantiques HTML: header, nav, main, footer, article, aside, section, div) ===
      case 'section':
      case 'box':
      case 'columns': {
        const isFreeMode = element.props?.layoutMode === 'free';
        const ContainerTag = (element.props?.tag || (element.type === 'section' ? 'section' : 'div')) as any;

        return (
          <ContainerTag
            style={{
              ...effectiveStyle,
              position: isFreeMode ? 'relative' : undefined,
              minHeight: isFreeMode ? '300px' : effectiveStyle.minHeight || '50px',
            }}
            className={getAnimationClass()}
          >
            {element.children && element.children.length > 0 ? (
              element.children.map((child: Element) => (
                <ElementRenderer
                  key={child.id}
                  element={child}
                  parent={element}
                  onContextMenu={onContextMenu}
                />
              ))
            ) : (
              <div className="p-4 border-2 border-dashed border-[#E6E6EE] dark:border-[#28283C] rounded-xl flex items-center justify-center text-xs text-[#8E8EA6] bg-black/2 dark:bg-white/2">
                Glissez des balises HTML ici ({element.props?.tag || element.type})
              </div>
            )}
          </ContainerTag>
        );
      }

      // === LISTE DYNAMIQUE (CMS) ===
      case 'dynamic_list': {
        const targetCollection =
          project.collections?.find(
            (c) =>
              c.id === element.props?.collectionId ||
              c.slug === element.props?.collectionSlug ||
              c.name.toLowerCase() === (element.props?.collectionSlug || '').toLowerCase()
          ) || project.collections?.[0];

        const template = element.children?.[0];
        const entries = targetCollection?.entries || [];

        if (!targetCollection || entries.length === 0) {
          return (
            <div
              style={effectiveStyle}
              className="p-8 border-2 border-dashed border-[#5B5BF0]/40 rounded-2xl flex flex-col items-center justify-center text-center bg-[#5B5BF0]/5"
            >
              <div className="w-10 h-10 rounded-xl bg-[#5B5BF0]/10 text-[#5B5BF0] flex items-center justify-center mb-2">
                <Database className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Liste Dynamique ({targetCollection?.name || 'Aucune collection'})
              </p>
              <p className="text-[11px] text-[#82829A] mt-1 max-w-sm">
                Cette collection ne contient aucune donnée pour le moment. Ajoutez des entrées dans l’onglet « Données ».
              </p>
            </div>
          );
        }

        if (!template) {
          return (
            <div style={effectiveStyle} className="p-4 border border-dashed text-xs text-[#82829A]">
              Modèle de carte manquant pour la liste dynamique.
            </div>
          );
        }

        const limit = element.props?.limit || 12;
        const displayedEntries = entries.slice(0, limit);

        return (
          <div style={effectiveStyle} className={`relative ${getAnimationClass()}`}>
            {displayedEntries.map((entry) => {
              const hydratedCard = applyItemDataBindings(
                template,
                entry,
                targetCollection.slug || targetCollection.name
              );
              return (
                <ElementRenderer
                  key={hydratedCard.id}
                  element={hydratedCard}
                  parent={element}
                  onContextMenu={onContextMenu}
                />
              );
            })}
          </div>
        );
      }

      // === FORMULAIRE (<form>) ===
      case 'form': {
        return (
          <form style={effectiveStyle} className={getAnimationClass()} onSubmit={(e) => e.preventDefault()}>
            {element.children && element.children.length > 0 ? (
              element.children.map((child: Element) => (
                <ElementRenderer
                  key={child.id}
                  element={child}
                  parent={element}
                  onContextMenu={onContextMenu}
                />
              ))
            ) : (
              <p className="text-xs text-[#8E8EA6]">Formulaire vide. Ajoutez des champs ci-dessous.</p>
            )}
          </form>
        );
      }

      // === CHAMP DE SAISIE (<input>) ===
      case 'input': {
        return (
          <div style={effectiveStyle} className={`flex flex-col gap-1 w-full ${getAnimationClass()}`}>
            {element.props?.label && (
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                {element.props.label}
              </label>
            )}
            <input
              type="text"
              placeholder={element.props?.placeholder || 'Texte indicatif...'}
              disabled
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl text-[#1B1B2F] dark:text-[#F4F4F9] pointer-events-none"
            />
          </div>
        );
      }

      // === CASE À COCHER (<input type="checkbox">) ===
      case 'checkbox': {
        return (
          <label style={effectiveStyle} className={`flex items-center gap-2 select-none cursor-pointer ${getAnimationClass()}`}>
            <input
              type="checkbox"
              defaultChecked={element.props?.checked}
              disabled
              className="w-4 h-4 rounded text-[#5B5BF0] pointer-events-none"
            />
            <span className="text-xs text-[#1B1B2F] dark:text-[#F4F4F9]">
              {element.props?.label || 'Case à cocher'}
            </span>
          </label>
        );
      }

      // === LISTE (<ul><li>) ===
      case 'list': {
        const items = element.props?.items || ['Premier point clé', 'Deuxième avantage', 'Troisième élément'];
        return (
          <ul style={effectiveStyle} className={`space-y-1.5 ${getAnimationClass()}`}>
            {items.map((item: string, idx: number) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]">
                <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      }

      // === BALISE / BADGE / TAG (<span>) ===
      case 'badge': {
        const IconComponent = element.props?.iconName ? iconCatalog[element.props.iconName] : null;
        if (isEditing) {
          return (
            <input
              type="text"
              value={element.props?.text || ''}
              onChange={(e) => updateElementProps(element.id, { text: e.target.value })}
              onBlur={() => setInlineEditingId(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setInlineEditingId(null);
              }}
              autoFocus
              className="bg-transparent border-b-2 border-current outline-none text-center font-bold px-1 min-w-[60px]"
              style={effectiveStyle}
            />
          );
        }
        return (
          <span
            style={effectiveStyle}
            className={`inline-flex items-center gap-1.5 transition-all select-none ${getAnimationClass()}`}
          >
            {IconComponent && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
            <span>{getTranslatedProp('props.text', element.props?.text || 'Balise active')}</span>
          </span>
        );
      }

      default:
        return <div style={effectiveStyle}>{element.type}</div>;
    }
  };

  // Indicateurs d'insertion
  const isDropInside = dropIndicator?.targetParentId === element.id && dropIndicator?.position === 'inside';
  const isDropBefore = dropIndicator?.targetParentId === element.id && dropIndicator?.position === 'before';
  const isDropAfter = dropIndicator?.targetParentId === element.id && dropIndicator?.position === 'after';

  // Style appliqué au conteneur externe englobant
  const wrapperStyle: React.CSSProperties = {
    position: isAbsolute ? 'absolute' : 'relative',
    ...(isAbsolute
      ? {
          left: effectiveStyle.left !== undefined ? effectiveStyle.left : 0,
          top: effectiveStyle.top !== undefined ? effectiveStyle.top : 0,
          zIndex: effectiveStyle.zIndex !== undefined ? effectiveStyle.zIndex : 10,
        }
      : {}),
    width: effectiveStyle.width,
    height: effectiveStyle.height,
    maxWidth: effectiveStyle.maxWidth,
    minWidth: effectiveStyle.minWidth,
    minHeight: effectiveStyle.minHeight,
  };

  return (
    <div
      ref={wrapperRef}
      id={element.id}
      data-element-id={element.id}
      style={wrapperStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => onContextMenu(e, element.id)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`group transition-all duration-100 ${
        isSelected
          ? 'outline-2 outline-[#5B5BF0] outline-offset-1 z-20'
          : 'hover:outline-1 hover:outline-dashed hover:outline-[#5B5BF0]/60'
      } ${element.locked ? 'cursor-not-allowed opacity-90' : isAbsolute ? 'cursor-move' : 'cursor-default'} ${
        isDropInside ? 'ring-2 ring-[#5B5BF0] ring-inset bg-[#EEF0FE]/20' : ''
      }`}
    >
      {/* Indicateur d'insertion bleu AVANT */}
      {isDropBefore && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#5B5BF0] -translate-y-1/2 z-30 rounded-full animate-pulse shadow-md pointer-events-none" />
      )}

      {/* Mini barre d'outils flottante au-dessus de l'élément sélectionné */}
      {isPrimarySelected && (
        <FloatingMiniToolbar element={element} />
      )}

      {/* Poignée de déplacement libre (Style Canva / Figma) */}
      {isPrimarySelected && !element.locked && (
        <button
          type="button"
          onMouseDown={handleFreeMoveStart}
          title="Glisser pour déplacer librement l'élément n'importe où (Style Canva)"
          className="absolute -top-3.5 -left-3.5 z-40 w-7 h-7 rounded-full bg-[#5B5BF0] hover:bg-[#4747E2] active:bg-[#3434C2] text-white shadow-lg flex items-center justify-center cursor-move hover:scale-110 active:scale-95 transition-transform"
        >
          <Move className="w-3.5 h-3.5 pointer-events-none" />
        </button>
      )}

      {/* Badge indicateur de mode libre */}
      {isPrimarySelected && isAbsolute && !movingInfo && !resizingInfo && (
        <span className="absolute -top-3 -right-3 z-40 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#10B981] text-white shadow-xs pointer-events-none">
          Libre
        </span>
      )}

      {/* Infobulle de dimensions dynamiques lors du redimensionnement */}
      {resizingInfo && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-50 px-2.5 py-1 bg-[#1B1B2F] text-white text-[11px] font-mono font-bold rounded-lg shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in">
          ↔ {resizingInfo.width}px × ↕ {resizingInfo.height}px
        </div>
      )}

      {/* Infobulle de coordonnées dynamiques lors du déplacement libre */}
      {movingInfo && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-50 px-2.5 py-1 bg-[#10B981] text-white text-[11px] font-mono font-bold rounded-lg shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in flex items-center gap-1.5">
          <Move className="w-3 h-3" />
          <span>X: {movingInfo.x}px, Y: {movingInfo.y}px</span>
        </div>
      )}

      {/* 8 Poignées de redimensionnement interactif */}
      {isPrimarySelected && !element.locked && (
        <>
          {/* Coins (Redimensionnement 2D) */}
          <div
            onMouseDown={(e) => handleResizeStart('nw', e)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              updateElementStyle(element.id, { width: 'auto', height: 'auto' }, viewportMode);
            }}
            title="Redimensionner coin sup-gauche"
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#5B5BF0] rounded-xs shadow-xs cursor-nwse-resize z-40 hover:scale-125 transition-transform"
          />
          <div
            onMouseDown={(e) => handleResizeStart('ne', e)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              updateElementStyle(element.id, { width: 'auto', height: 'auto' }, viewportMode);
            }}
            title="Redimensionner coin sup-droit"
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#5B5BF0] rounded-xs shadow-xs cursor-nesw-resize z-40 hover:scale-125 transition-transform"
          />
          <div
            onMouseDown={(e) => handleResizeStart('se', e)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              updateElementStyle(element.id, { width: 'auto', height: 'auto' }, viewportMode);
            }}
            title="Redimensionner coin inf-droit"
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#5B5BF0] rounded-xs shadow-xs cursor-nwse-resize z-40 hover:scale-125 transition-transform"
          />
          <div
            onMouseDown={(e) => handleResizeStart('sw', e)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              updateElementStyle(element.id, { width: 'auto', height: 'auto' }, viewportMode);
            }}
            title="Redimensionner coin inf-gauche"
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#5B5BF0] rounded-xs shadow-xs cursor-nesw-resize z-40 hover:scale-125 transition-transform"
          />

          {/* Bords (Redimensionnement 1D) */}
          <div
            onMouseDown={(e) => handleResizeStart('n', e)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              updateElementStyle(element.id, { height: 'auto' }, viewportMode);
            }}
            title="Ajuster la hauteur (Haut)"
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border-2 border-[#5B5BF0] rounded-xs shadow-xs cursor-ns-resize z-40 hover:scale-125 transition-transform"
          />
          <div
            onMouseDown={(e) => handleResizeStart('s', e)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              updateElementStyle(element.id, { height: 'auto' }, viewportMode);
            }}
            title="Ajuster la hauteur (Bas)"
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border-2 border-[#5B5BF0] rounded-xs shadow-xs cursor-ns-resize z-40 hover:scale-125 transition-transform"
          />
          <div
            onMouseDown={(e) => handleResizeStart('w', e)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              updateElementStyle(element.id, { width: 'auto' }, viewportMode);
            }}
            title="Ajuster la largeur (Gauche)"
            className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-4 bg-white border-2 border-[#5B5BF0] rounded-xs shadow-xs cursor-ew-resize z-40 hover:scale-125 transition-transform"
          />
          <div
            onMouseDown={(e) => handleResizeStart('e', e)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              updateElementStyle(element.id, { width: 'auto' }, viewportMode);
            }}
            title="Ajuster la largeur (Droite)"
            className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-4 bg-white border-2 border-[#5B5BF0] rounded-xs shadow-xs cursor-ew-resize z-40 hover:scale-125 transition-transform"
          />
        </>
      )}

      {/* Corps de l'élément */}
      {renderContent()}

      {/* Indicateur d'insertion bleu APRÈS */}
      {isDropAfter && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#5B5BF0] translate-y-1/2 z-30 rounded-full animate-pulse shadow-md pointer-events-none" />
      )}
    </div>
  );
}
