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
  Compass,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  ToggleRight,
  Images,
  Layers,
  CircleDot,
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
  Compass,
  TrendingUp,
  Percent,
  Youtube: Play,
  Images,
  Layers,
  AlertCircle: AlertTriangle,
};

function getEmbedUrl(url: string): string {
  if (!url) return 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
}

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

  // Normalisation de l'image de fond si une URL simple est fournie
  if (effectiveStyle.backgroundImage && typeof effectiveStyle.backgroundImage === 'string') {
    const bgVal = effectiveStyle.backgroundImage.trim();
    if (
      bgVal &&
      !bgVal.startsWith('url(') &&
      !bgVal.startsWith('linear-gradient') &&
      !bgVal.startsWith('radial-gradient') &&
      bgVal !== 'none'
    ) {
      effectiveStyle.backgroundImage = `url('${bgVal}')`;
    }
  }

  // Éviter le mélange des propriétés raccourcies (flex) et détaillées (flexGrow/flexShrink/flexBasis)
  if (effectiveStyle.flex !== undefined && effectiveStyle.flex !== '') {
    delete (effectiveStyle as any).flexGrow;
    delete (effectiveStyle as any).flexShrink;
    delete (effectiveStyle as any).flexBasis;
  } else {
    delete (effectiveStyle as any).flex;
  }

  const isAbsolute = effectiveStyle.position === 'absolute';

  // Style nettoyé des coordonnées absolues pour le rendu interne (évite le double décalage)
  const innerStyle: React.CSSProperties = {
    ...effectiveStyle,
    position: undefined,
    left: undefined,
    top: undefined,
    zIndex: undefined,
    margin: isAbsolute ? 0 : effectiveStyle.margin,
  };

  // Gestion du redimensionnement interactif ultra-fluide avec aimantation et limites strictes
  const handleResizeStart = (direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (element.locked) return;

    const elNode = wrapperRef.current;
    if (!elNode) return;

    const elRect = elNode.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const currentZoom = zoom || 1;
    const startWidth = Math.round(elRect.width / currentZoom);
    const startHeight = Math.round(elRect.height / currentZoom);

    const parentNode = elNode.parentElement;
    const parentRect = parentNode?.getBoundingClientRect() || {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const parentWidth = Math.max(50, Math.round(parentRect.width / currentZoom));
    const parentHeight = Math.max(50, Math.round(parentRect.height / currentZoom));

    const startLeft = typeof effectiveStyle.left === 'number'
      ? effectiveStyle.left
      : parseInt(String(effectiveStyle.left || ''), 10) || Math.max(0, Math.round((elRect.left - parentRect.left) / currentZoom));
    const startTop = typeof effectiveStyle.top === 'number'
      ? effectiveStyle.top
      : parseInt(String(effectiveStyle.top || ''), 10) || Math.max(0, Math.round((elRect.top - parentRect.top) / currentZoom));

    let finalW = startWidth;
    let finalH = startHeight;
    let finalL = startLeft;
    let finalT = startTop;

    const SNAP_THRESHOLD = 6;

    const onMouseMove = (moveEvt: MouseEvent) => {
      moveEvt.preventDefault();
      const dx = (moveEvt.clientX - startX) / currentZoom;
      const dy = (moveEvt.clientY - startY) / currentZoom;

      let w = startWidth;
      let h = startHeight;
      let l = startLeft;
      let t = startTop;

      // 1. Est (Bord droit)
      if (direction.includes('e')) {
        const maxW = Math.max(20, parentWidth - startLeft);
        let targetW = Math.round(startWidth + dx);
        if (Math.abs(targetW - maxW) < SNAP_THRESHOLD) targetW = maxW;
        w = Math.max(20, Math.min(targetW, maxW));
      }

      // 2. Ouest (Bord gauche)
      if (direction.includes('w')) {
        const maxW = Math.max(20, startLeft + startWidth);
        let targetW = Math.round(startWidth - dx);
        if (Math.abs(targetW - maxW) < SNAP_THRESHOLD) targetW = maxW;
        w = Math.max(20, Math.min(targetW, maxW));
        l = Math.max(0, Math.min(startLeft + (startWidth - w), parentWidth - w));
      }

      // 3. Sud (Bord bas)
      if (direction.includes('s')) {
        const maxH = Math.max(20, parentHeight - startTop);
        let targetH = Math.round(startHeight + dy);
        if (Math.abs(targetH - maxH) < SNAP_THRESHOLD) targetH = maxH;
        h = Math.max(20, Math.min(targetH, maxH));
      }

      // 4. Nord (Bord haut)
      if (direction.includes('n')) {
        const maxH = Math.max(20, startTop + startHeight);
        let targetH = Math.round(startHeight - dy);
        if (Math.abs(targetH - maxH) < SNAP_THRESHOLD) targetH = maxH;
        h = Math.max(20, Math.min(targetH, maxH));
        t = Math.max(0, Math.min(startTop + (startHeight - h), parentHeight - h));
      }

      finalW = w;
      finalH = h;
      finalL = l;
      finalT = t;

      setResizingInfo({ width: w, height: h });
      if (elNode) {
        elNode.style.width = `${w}px`;
        elNode.style.height = `${h}px`;
        if (direction.includes('w')) {
          elNode.style.left = `${l}px`;
        }
        if (direction.includes('n')) {
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
      if (isAbsolute || direction.includes('w') || direction.includes('n')) {
        updates.position = 'absolute';
        if (direction.includes('w')) updates.left = `${finalL}px`;
        if (direction.includes('n')) updates.top = `${finalT}px`;
      }
      updateElementStyle(element.id, updates, viewportMode);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Déplacement libre à la souris (style Canva / Figma) ultra-fluide avec aimantation et limites strictes
  const handleFreeMoveStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.locked || isEditing) return;

    const elNode = wrapperRef.current;
    if (!elNode) return;

    const parentNode = elNode.parentElement;
    const parentRect = parentNode?.getBoundingClientRect() || {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const currentZoom = zoom || 1;

    const parentWidth = Math.max(50, Math.round(parentRect.width / currentZoom));
    const parentHeight = Math.max(50, Math.round(parentRect.height / currentZoom));
    const elRect = elNode.getBoundingClientRect();
    const elemWidth = Math.round(elRect.width / currentZoom);
    const elemHeight = Math.round(elRect.height / currentZoom);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;

    const startLeft = isAbsolute && typeof effectiveStyle.left === 'number'
      ? effectiveStyle.left
      : isAbsolute && typeof effectiveStyle.left === 'string' && !isNaN(parseInt(effectiveStyle.left, 10))
      ? parseInt(effectiveStyle.left, 10)
      : Math.max(0, Math.round((elRect.left - parentRect.left) / currentZoom));

    const startTop = isAbsolute && typeof effectiveStyle.top === 'number'
      ? effectiveStyle.top
      : isAbsolute && typeof effectiveStyle.top === 'string' && !isNaN(parseInt(effectiveStyle.top, 10))
      ? parseInt(effectiveStyle.top, 10)
      : Math.max(0, Math.round((elRect.top - parentRect.top) / currentZoom));

    const maxLeft = Math.max(0, parentWidth - elemWidth);
    const maxTop = Math.max(0, parentHeight - elemHeight);

    let finalLeft = startLeft;
    let finalTop = startTop;
    let hasMoved = false;

    const SNAP_THRESHOLD = 8;
    const parentCenterX = parentWidth / 2;
    const parentCenterY = parentHeight / 2;

    const onMouseMove = (moveEvt: MouseEvent) => {
      const dx = (moveEvt.clientX - startMouseX) / currentZoom;
      const dy = (moveEvt.clientY - startMouseY) / currentZoom;

      // Seuil de déclenchement (4px) pour éviter le déplacement involontaire lors d'un clic
      if (!hasMoved) {
        if (Math.hypot(moveEvt.clientX - startMouseX, moveEvt.clientY - startMouseY) < 4) {
          return;
        }
        hasMoved = true;
      }

      moveEvt.preventDefault();

      let rawLeft = Math.round(startLeft + dx);
      let rawTop = Math.round(startTop + dy);

      let isCenteredX = false;
      let isCenteredY = false;

      // Aimantation au centre horizontal de la page
      const elemCenterX = rawLeft + elemWidth / 2;
      if (Math.abs(elemCenterX - parentCenterX) < SNAP_THRESHOLD) {
        rawLeft = Math.round(parentCenterX - elemWidth / 2);
        isCenteredX = true;
      } else if (Math.abs(rawLeft) < SNAP_THRESHOLD) {
        rawLeft = 0;
      } else if (Math.abs(rawLeft - maxLeft) < SNAP_THRESHOLD) {
        rawLeft = maxLeft;
      }

      // Aimantation au centre vertical de la page
      const elemCenterY = rawTop + elemHeight / 2;
      if (Math.abs(elemCenterY - parentCenterY) < SNAP_THRESHOLD) {
        rawTop = Math.round(parentCenterY - elemHeight / 2);
        isCenteredY = true;
      } else if (Math.abs(rawTop) < SNAP_THRESHOLD) {
        rawTop = 0;
      } else if (Math.abs(rawTop - maxTop) < SNAP_THRESHOLD) {
        rawTop = maxTop;
      }

      // Limites strictes : l'élément reste 100% à l'intérieur du canevas
      finalLeft = Math.max(0, Math.min(rawLeft, maxLeft));
      finalTop = Math.max(0, Math.min(rawTop, maxTop));

      const isHittingBoundary =
        finalLeft === 0 || finalLeft === maxLeft || finalTop === 0 || finalTop === maxTop;

      setMovingInfo({
        x: finalLeft,
        y: finalTop,
        isAtBoundary: isHittingBoundary,
        isCenteredX,
        isCenteredY,
      } as any);

      if (elNode) {
        elNode.style.position = 'absolute';
        elNode.style.left = `${finalLeft}px`;
        elNode.style.top = `${finalTop}px`;
        if (element.type === 'heading' || element.type === 'text') {
          elNode.style.width = effectiveStyle.width ? String(effectiveStyle.width) : `${elemWidth}px`;
        }
        elNode.style.zIndex = '40';
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setMovingInfo(null);

      if (!hasMoved) return;

      pushSnapshot();
      updateElementStyle(
        element.id,
        {
          position: 'absolute',
          left: `${finalLeft}px`,
          top: `${finalTop}px`,
          width: effectiveStyle.width || (['heading', 'text'].includes(element.type) ? `${elemWidth}px` : undefined),
          zIndex: effectiveStyle.zIndex || 10,
        },
        viewportMode
      );
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Déplacement au clavier avec les flèches (← → ↑ ↓) pour l'élément sélectionné
  React.useEffect(() => {
    if (!isPrimarySelected || element.locked || !isAbsolute) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;

      e.preventDefault();
      const elNode = wrapperRef.current;
      if (!elNode) return;

      const parentNode = elNode.parentElement;
      const parentRect = parentNode?.getBoundingClientRect() || {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      const currentZoom = zoom || 1;
      const parentWidth = Math.max(100, Math.round(parentRect.width / currentZoom));
      const parentHeight = Math.max(100, Math.round(parentRect.height / currentZoom));
      const elRect = elNode.getBoundingClientRect();
      const elemWidth = Math.round(elRect.width / currentZoom);
      const elemHeight = Math.round(elRect.height / currentZoom);

      const currentLeft = typeof effectiveStyle.left === 'number'
        ? effectiveStyle.left
        : parseInt(String(effectiveStyle.left || '0'), 10) || 0;
      const currentTop = typeof effectiveStyle.top === 'number'
        ? effectiveStyle.top
        : parseInt(String(effectiveStyle.top || '0'), 10) || 0;

      const maxLeft = Math.max(0, parentWidth - elemWidth);
      const maxTop = Math.max(0, parentHeight - elemHeight);
      const step = e.shiftKey ? 10 : 1;

      let newLeft = currentLeft;
      let newTop = currentTop;

      if (e.key === 'ArrowLeft') newLeft = Math.max(0, currentLeft - step);
      if (e.key === 'ArrowRight') newLeft = Math.min(maxLeft, currentLeft + step);
      if (e.key === 'ArrowUp') newTop = Math.max(0, currentTop - step);
      if (e.key === 'ArrowDown') newTop = Math.min(maxTop, currentTop + step);

      updateElementStyle(element.id, { position: 'absolute', left: `${newLeft}px`, top: `${newTop}px` }, viewportMode);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPrimarySelected, element.locked, isAbsolute, effectiveStyle.left, effectiveStyle.top, zoom, viewportMode]);

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
              className="w-full bg-white/80 dark:bg-[#181824]/80 p-1 border-2 border-[#5B5BF0] rounded-md outline-none font-bold"
              style={innerStyle}
            />
          );
        }
        return (
          <Tag
            onMouseDown={!element.locked && !isEditing ? handleFreeMoveStart : undefined}
            style={{
              cursor: isPrimarySelected ? 'grab' : 'pointer',
              userSelect: 'none',
              ...innerStyle,
            }}
            className={`outline-none hover:opacity-95 transition-all ${getAnimationClass()}`}
          >
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
              style={innerStyle}
            />
          );
        }
        return (
          <TextTag
            onMouseDown={!element.locked && !isEditing ? handleFreeMoveStart : undefined}
            style={{
              cursor: isPrimarySelected ? 'grab' : 'pointer',
              userSelect: 'none',
              ...innerStyle,
            }}
            className={`whitespace-pre-wrap outline-none hover:opacity-95 transition-all ${getAnimationClass()}`}
          >
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

      // === BARRE DE NAVIGATION (<nav>) ===
      case 'navbar': {
        const links: Array<{ label: string; href: string }> = element.props?.links || [
          { label: 'Accueil', href: '#' },
          { label: 'Services', href: '#services' },
          { label: 'Tarifs', href: '#tarifs' },
          { label: 'Contact', href: '#contact' },
        ];
        const isMobileView = viewportMode === 'mobile';

        return (
          <nav
            style={effectiveStyle}
            className={`select-none transition-all ${getAnimationClass()}`}
          >
            {/* Logo / Marque */}
            <div className="flex items-center gap-2.5 font-extrabold text-sm sm:text-base text-[#1B1B2F] dark:text-[#F4F4F9]">
              {element.props?.brandLogoUrl ? (
                <img
                  src={element.props.brandLogoUrl}
                  alt={element.props?.brandText || 'Logo'}
                  className="h-7 w-auto object-contain"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5B5BF0] to-[#8B5CF6] text-white flex items-center justify-center shadow-xs">
                  <Compass className="w-4 h-4" />
                </div>
              )}
              <span className="tracking-tight">
                {element.props?.brandText || 'Studio App'}
              </span>
            </div>

            {/* Liens de navigation (Mode Grand Écran) */}
            {!isMobileView && (
              <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#62627A] dark:text-[#A5A5BC]">
                {links.map((lnk, idx) => (
                  <a
                    key={idx}
                    href={lnk.href || '#'}
                    onClick={(e) => e.preventDefault()}
                    className="hover:text-[#5B5BF0] dark:hover:text-[#7D7DF8] transition-colors"
                  >
                    {lnk.label}
                  </a>
                ))}
              </div>
            )}

            {/* Bouton CTA ou Menu Hamburger */}
            <div className="flex items-center gap-3">
              {element.props?.ctaLabel && !isMobileView && (
                <a
                  href={element.props?.ctaHref || '#'}
                  onClick={(e) => e.preventDefault()}
                  className="px-4 py-2 rounded-xl bg-[#5B5BF0] hover:bg-[#4747E2] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {element.props.ctaLabel}
                </a>
              )}
              {isMobileView && (
                <button
                  type="button"
                  className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-[#1B1B2F] dark:text-[#F4F4F9]"
                  title="Menu mobile"
                >
                  <Menu className="w-4 h-4" />
                </button>
              )}
            </div>
          </nav>
        );
      }

      // === ONGLETS INTERACTIFS (Tabs Switcher) ===
      case 'tabs': {
        const tabsList: Array<{ title: string; content: string }> = element.props?.tabs || [
          { title: 'Onglet 1', content: 'Contenu du premier volet.' },
          { title: 'Onglet 2', content: 'Contenu du deuxième volet.' },
        ];
        const activeIdx = Math.min(element.props?.activeIndex || 0, Math.max(0, tabsList.length - 1));

        return (
          <div style={effectiveStyle} className={`flex flex-col gap-4 ${getAnimationClass()}`}>
            {/* Barre des onglets */}
            <div className="flex border-b border-[#E6E6EE] dark:border-[#28283C] gap-2 overflow-x-auto">
              {tabsList.map((tItem, tIdx) => (
                <button
                  key={tIdx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateElementProps(element.id, { activeIndex: tIdx });
                  }}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeIdx === tIdx
                      ? 'border-[#5B5BF0] text-[#5B5BF0] dark:text-[#7D7DF8]'
                      : 'border-transparent text-[#8E8EA6] hover:text-[#1B1B2F] dark:hover:text-white'
                  }`}
                >
                  {tItem.title || `Onglet ${tIdx + 1}`}
                </button>
              ))}
            </div>

            {/* Contenu de l'onglet actif */}
            <div className="text-xs text-[#62627A] dark:text-[#A5A5BC] leading-relaxed p-1">
              {tabsList[activeIdx]?.content || 'Contenu sélectionné.'}
            </div>
          </div>
        );
      }

      // === ÉTOILES DE NOTATION / AVIS (Rating) ===
      case 'rating': {
        const score = Number(element.props?.score ?? 5);
        const maxScore = Number(element.props?.maxScore ?? 5);

        return (
          <div style={effectiveStyle} className={`select-none ${getAnimationClass()}`}>
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: maxScore }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < score ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            {element.props?.showNumber && (
              <span className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9] ml-2">
                {score.toFixed(1)} / {maxScore}
              </span>
            )}
            {element.props?.reviewCount && (
              <span className="text-[11px] text-[#8E8EA6] dark:text-[#75758E] ml-1.5">
                ({element.props.reviewCount})
              </span>
            )}
          </div>
        );
      }

      // === CHIFFRE CLÉ / STATISTIQUE (KPI) ===
      case 'stat_kpi': {
        const IconComp = element.props?.iconName ? iconCatalog[element.props.iconName] || Zap : Zap;

        return (
          <div style={effectiveStyle} className={`flex flex-col gap-2 ${getAnimationClass()}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8E8EA6] dark:text-[#75758E] uppercase tracking-wider">
                {element.props?.label || 'Indicateur Clé'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#282846] dark:text-[#7D7DF8] flex items-center justify-center">
                <IconComp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#1B1B2F] dark:text-[#F4F4F9] tracking-tight">
              {element.props?.value || '100%'}
            </div>
            {element.props?.trend && (
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{element.props.trend}</span>
              </div>
            )}
          </div>
        );
      }

      // === ALERTE / CALLOUT (<aside>) ===
      case 'alert': {
        const variant = element.props?.variant || 'info';
        const stylesByVariant: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
          info: {
            bg: 'bg-indigo-50 dark:bg-indigo-950/40',
            border: 'border-indigo-200 dark:border-indigo-900',
            text: 'text-indigo-900 dark:text-indigo-200',
            icon: <Info className="w-4 h-4 text-indigo-600 shrink-0" />,
          },
          success: {
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
            border: 'border-emerald-200 dark:border-emerald-900',
            text: 'text-emerald-900 dark:text-emerald-200',
            icon: <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />,
          },
          warning: {
            bg: 'bg-amber-50 dark:bg-amber-950/40',
            border: 'border-amber-200 dark:border-amber-900',
            text: 'text-amber-900 dark:text-amber-200',
            icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
          },
          error: {
            bg: 'bg-red-50 dark:bg-red-950/40',
            border: 'border-red-200 dark:border-red-900',
            text: 'text-red-900 dark:text-red-200',
            icon: <XCircle className="w-4 h-4 text-red-600 shrink-0" />,
          },
        };

        const currentStyle = stylesByVariant[variant] || stylesByVariant.info;

        return (
          <aside
            style={effectiveStyle}
            className={`p-4 rounded-xl border flex items-start gap-3 ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text} ${getAnimationClass()}`}
          >
            {currentStyle.icon}
            <div className="flex-1 min-w-0">
              {element.props?.title && (
                <h4 className="text-xs font-bold mb-0.5">{element.props.title}</h4>
              )}
              <p className="text-xs opacity-90 leading-relaxed">{element.props?.message || 'Message informatif'}</p>
            </div>
          </aside>
        );
      }

      // === VIDÉO EMBED YOUTUBE / VIMEO ===
      case 'video_embed': {
        const embedSrc = getEmbedUrl(element.props?.videoUrl || '');

        return (
          <div style={effectiveStyle} className={`relative overflow-hidden bg-black ${getAnimationClass()}`}>
            <iframe
              src={embedSrc}
              title={element.props?.title || 'Vidéo streaming'}
              className="w-full h-full border-0 pointer-events-none select-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }

      // === CARROUSEL / SLIDER D'IMAGES ===
      case 'carousel': {
        const images: Array<{ url: string; caption?: string }> = element.props?.images || [
          { url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80', caption: 'Diapositive 1' },
          { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80', caption: 'Diapositive 2' },
        ];
        const [currentSlide, setCurrentSlide] = [
          element.props?.currentSlideIndex || 0,
          (idx: number) => updateElementProps(element.id, { currentSlideIndex: idx }),
        ];
        const activeSlide = images[Math.min(currentSlide, images.length - 1)] || images[0];

        return (
          <div style={effectiveStyle} className={`relative group overflow-hidden bg-black/90 ${getAnimationClass()}`}>
            <img
              src={activeSlide?.url}
              alt={activeSlide?.caption || 'Carrousel'}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {activeSlide?.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-semibold">
                {activeSlide.caption}
              </div>
            )}
            {/* Flèches de navigation */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((currentSlide - 1 + images.length) % images.length);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((currentSlide + 1) % images.length);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Puces indicatrices */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {images.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`h-1.5 rounded-full transition-all ${
                    dotIdx === currentSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        );
      }

      // === ZONE DE TEXTE MULTILIGNE (<textarea>) ===
      case 'textarea': {
        return (
          <div style={effectiveStyle} className={`flex flex-col gap-1 w-full ${getAnimationClass()}`}>
            {element.props?.label && (
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                {element.props.label}
              </label>
            )}
            <textarea
              rows={element.props?.rows || 4}
              placeholder={element.props?.placeholder || 'Saisissez votre message...'}
              disabled
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl text-[#1B1B2F] dark:text-[#F4F4F9] pointer-events-none resize-none"
            />
          </div>
        );
      }

      // === MENU DÉROULANT (<select><option>) ===
      case 'select': {
        const options: string[] = element.props?.options || ['Option 1', 'Option 2', 'Option 3'];

        return (
          <div style={effectiveStyle} className={`flex flex-col gap-1 w-full ${getAnimationClass()}`}>
            {element.props?.label && (
              <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                {element.props.label}
              </label>
            )}
            <select
              disabled
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-xl text-[#1B1B2F] dark:text-[#F4F4F9] pointer-events-none"
            >
              {options.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );
      }

      // === BOUTONS RADIO (<input type="radio">) ===
      case 'radio': {
        const options: string[] = element.props?.options || ['Choix A', 'Choix B'];
        const currentVal = element.props?.defaultValue || options[0];

        return (
          <div style={effectiveStyle} className={`flex flex-col gap-2 w-full ${getAnimationClass()}`}>
            {element.props?.label && (
              <span className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                {element.props.label}
              </span>
            )}
            <div className="space-y-1.5">
              {options.map((opt, i) => (
                <label key={i} className="flex items-center gap-2 text-xs text-[#1B1B2F] dark:text-[#F4F4F9] cursor-pointer">
                  <input
                    type="radio"
                    name={element.props?.name || element.id}
                    defaultChecked={opt === currentVal}
                    disabled
                    className="w-4 h-4 text-[#5B5BF0] pointer-events-none"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        );
      }

      // === INTERRUPTEUR / TOGGLE (Switch) ===
      case 'switch': {
        const isChecked = element.props?.checked ?? true;

        return (
          <div style={effectiveStyle} className={`select-none ${getAnimationClass()}`}>
            <span className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
              {element.props?.label || 'Interrupteur'}
            </span>
            <div
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                isChecked ? 'bg-[#5B5BF0]' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isChecked ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        );
      }

      // === CURSEUR / SLIDER (<input type="range">) ===
      case 'range': {
        const val = element.props?.value ?? 50;
        const min = element.props?.min ?? 0;
        const max = element.props?.max ?? 100;
        const unit = element.props?.unit || '';

        return (
          <div style={effectiveStyle} className={`w-full select-none ${getAnimationClass()}`}>
            <div className="flex items-center justify-between text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
              <span>{element.props?.label || 'Curseur'}</span>
              <span className="px-2 py-0.5 rounded-md bg-[#EEF0FE] text-[#5B5BF0] dark:bg-[#282846] font-bold">
                {val} {unit}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={val}
              disabled
              className="w-full accent-[#5B5BF0] pointer-events-none"
            />
          </div>
        );
      }

      // === BARRE DE PROGRESSION (<progress>) ===
      case 'progress_bar': {
        const val = Number(element.props?.value ?? 60);
        const max = Number(element.props?.max ?? 100);
        const percentage = Math.round((val / max) * 100);

        return (
          <div style={effectiveStyle} className={`w-full select-none ${getAnimationClass()}`}>
            <div className="flex items-center justify-between text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
              <span>{element.props?.label || 'Progression'}</span>
              {element.props?.showPercentage !== false && (
                <span className="font-bold text-[#5B5BF0]">{percentage}%</span>
              )}
            </div>
            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${percentage}%`,
                  backgroundColor: element.props?.color || '#5B5BF0',
                }}
                className="h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>
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

  // Style appliqué au conteneur externe englobant (inclut les propriétés d'enfant Flex & Grid)
  const wrapperStyle: React.CSSProperties = {
    position: isAbsolute ? 'absolute' : 'relative',
    ...(isAbsolute
      ? {
          left: effectiveStyle.left !== undefined ? effectiveStyle.left : 0,
          top: effectiveStyle.top !== undefined ? effectiveStyle.top : 0,
          zIndex: effectiveStyle.zIndex !== undefined ? effectiveStyle.zIndex : 10,
        }
      : {
          margin: effectiveStyle.margin,
          ...(effectiveStyle.flex !== undefined
            ? { flex: effectiveStyle.flex }
            : {
                flexGrow: effectiveStyle.flexGrow,
                flexShrink: effectiveStyle.flexShrink,
                flexBasis: effectiveStyle.flexBasis,
              }),
          gridColumn: effectiveStyle.gridColumn,
          gridRow: effectiveStyle.gridRow,
          alignSelf: effectiveStyle.alignSelf,
          justifySelf: effectiveStyle.justifySelf,
          order: effectiveStyle.order,
        }),
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
      onMouseDown={isPrimarySelected && !element.locked && !isEditing ? handleFreeMoveStart : undefined}
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

      {/* Guide visuel d'alignement au centre horizontal */}
      {movingInfo && (movingInfo as any).isCenteredX && (
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 border-r-2 border-dashed border-[#5B5BF0] -translate-x-1/2 pointer-events-none z-30 animate-pulse" />
      )}

      {/* Guide visuel d'alignement au centre vertical */}
      {movingInfo && (movingInfo as any).isCenteredY && (
        <div className="absolute left-0 right-0 top-1/2 h-0.5 border-b-2 border-dashed border-[#5B5BF0] -translate-y-1/2 pointer-events-none z-30 animate-pulse" />
      )}

      {/* Infobulle de coordonnées dynamiques lors du déplacement libre */}
      {movingInfo && (
        <div
          className={`absolute -top-9 left-1/2 -translate-x-1/2 z-50 px-2.5 py-1 text-white text-[11px] font-mono font-bold rounded-lg shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in flex items-center gap-1.5 ${
            (movingInfo as any).isCenteredX || (movingInfo as any).isCenteredY
              ? 'bg-[#5B5BF0] ring-2 ring-[#7D7DF8]'
              : (movingInfo as any).isAtBoundary
              ? 'bg-amber-600 ring-2 ring-amber-400'
              : 'bg-[#10B981]'
          }`}
        >
          <Move className="w-3 h-3" />
          <span>
            X: {movingInfo.x}px, Y: {movingInfo.y}px
            {(movingInfo as any).isCenteredX && (movingInfo as any).isCenteredY
              ? ' 🎯 [Centré Horizontale & Verticale]'
              : (movingInfo as any).isCenteredX
              ? ' 🎯 [Centré Horizontale]'
              : (movingInfo as any).isCenteredY
              ? ' 🎯 [Centré Verticale]'
              : (movingInfo as any).isAtBoundary
              ? ' 🔒 [Limite du canevas]'
              : ''}
          </span>
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
