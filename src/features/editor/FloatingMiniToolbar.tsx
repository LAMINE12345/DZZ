'use client';

import * as React from 'react';
import { useAppStore } from '@/src/core/store';
import { Element } from '@/src/core/types';
import {
  Copy,
  Trash2,
  Lock,
  Unlock,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Palette,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Zap,
  Move,
  Maximize2,
} from 'lucide-react';
import { Popover } from '@/src/shared/ui';

interface FloatingMiniToolbarProps {
  element: Element;
  position?: { top: number; left: number };
}

const QUICK_COLORS = ['#5B5BF0', '#14B8A6', '#10B981', '#F59E0B', '#EF4444', '#1B1B2F', '#FFFFFF', '#62627A'];

export function FloatingMiniToolbar({ element }: FloatingMiniToolbarProps) {
  const {
    duplicateElement,
    deleteElement,
    lockElement,
    hideElement,
    moveElementOrder,
    updateElementStyle,
    updateElementProps,
    viewportMode,
    addBehaviorForElement,
    pushSnapshot,
    addToast,
    zoom,
  } = useAppStore();

  const currentStyle = element.style?.[viewportMode] || element.style?.desktop || {};
  const isFreePosition = currentStyle.position === 'absolute';

  const toggleFreePosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    pushSnapshot();
    if (isFreePosition) {
      updateElementStyle(
        element.id,
        { position: undefined, left: undefined, top: undefined, zIndex: undefined },
        viewportMode
      );
      addToast({
        type: 'info',
        title: 'Flux normal rétabli',
        message: "L'élément s'aligne désormais dans le flux continu de la page.",
      });
    } else {
      const elNode = document.getElementById(element.id) || document.querySelector(`[data-element-id="${element.id}"]`);
      const parentNode = elNode?.parentElement;
      let left = 24;
      let top = 24;
      if (elNode && parentNode) {
        const pRect = parentNode.getBoundingClientRect();
        const eRect = elNode.getBoundingClientRect();
        left = Math.max(0, Math.round((eRect.left - pRect.left) / zoom));
        top = Math.max(0, Math.round((eRect.top - pRect.top) / zoom));
      }
      updateElementStyle(
        element.id,
        { position: 'absolute', left: `${left}px`, top: `${top}px`, zIndex: 10 },
        viewportMode
      );
      addToast({
        type: 'success',
        title: 'Position libre (Canva) activée',
        message: "Vous pouvez déplacer ou redimensionner cet élément en toute liberté sur le canva !",
      });
    }
  };

  const centerElementInContainer = (e: React.MouseEvent) => {
    e.stopPropagation();
    pushSnapshot();
    const elNode = document.getElementById(element.id) || document.querySelector(`[data-element-id="${element.id}"]`);
    const parentNode = elNode?.parentElement;
    if (parentNode && elNode) {
      const pRect = parentNode.getBoundingClientRect();
      const eRect = elNode.getBoundingClientRect();
      const centerLeft = Math.max(0, Math.round(((pRect.width - eRect.width) / 2) / zoom));
      updateElementStyle(element.id, { position: 'absolute', left: `${centerLeft}px` }, viewportMode);
      addToast({ type: 'info', title: 'Centrage', message: `Élément centré à ${centerLeft}px.` });
    }
  };

  const isTextBased = ['heading', 'text', 'button'].includes(element.type);

  const toggleBold = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isBold = currentStyle.fontWeight === '700' || currentStyle.fontWeight === '800' || currentStyle.fontWeight === 'bold';
    updateElementStyle(element.id, { fontWeight: isBold ? '400' : '700' }, viewportMode);
  };

  const toggleItalic = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isItalic = currentStyle.fontStyle === 'italic';
    updateElementStyle(element.id, { fontStyle: isItalic ? 'normal' : 'italic' }, viewportMode);
  };

  const setTextAlign = (align: 'left' | 'center' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    updateElementStyle(element.id, { textAlign: align }, viewportMode);
  };

  const setTextColor = (color: string) => {
    if (element.type === 'button') {
      updateElementStyle(element.id, { backgroundColor: color }, viewportMode);
    } else {
      updateElementStyle(element.id, { color }, viewportMode);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute -top-11 left-0 z-40 flex items-center gap-0.5 p-1 bg-[#1B1B2F] text-white rounded-xl shadow-xl border border-white/20 select-none animate-in fade-in zoom-in-95 text-xs font-medium backdrop-blur-md"
    >
      <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold text-[#14B8A6] bg-white/10 rounded-md">
        {element.type}
      </span>

      <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

      {/* Formatage de texte */}
      {isTextBased && (
        <>
          <button
            type="button"
            onClick={toggleBold}
            title="Gras"
            className={`p-1.5 rounded-lg hover:bg-white/20 transition-colors ${
              currentStyle.fontWeight === '700' || currentStyle.fontWeight === '800' ? 'bg-white/30' : ''
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleItalic}
            title="Italique"
            className={`p-1.5 rounded-lg hover:bg-white/20 transition-colors ${
              currentStyle.fontStyle === 'italic' ? 'bg-white/30' : ''
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => setTextAlign('left', e)}
            title="Aligner à gauche"
            className={`p-1.5 rounded-lg hover:bg-white/20 transition-colors ${
              currentStyle.textAlign === 'left' ? 'bg-white/30' : ''
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => setTextAlign('center', e)}
            title="Centrer"
            className={`p-1.5 rounded-lg hover:bg-white/20 transition-colors ${
              currentStyle.textAlign === 'center' ? 'bg-white/30' : ''
            }`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => setTextAlign('right', e)}
            title="Aligner à droite"
            className={`p-1.5 rounded-lg hover:bg-white/20 transition-colors ${
              currentStyle.textAlign === 'right' ? 'bg-white/30' : ''
            }`}
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <Popover
            trigger={
              <button
                type="button"
                title="Couleur rapide"
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-1"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="p-2 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Couleur rapide
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {QUICK_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTextColor(c)}
                    className="w-6 h-6 rounded-md border border-black/10 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </Popover>

          <div className="w-[1px] h-4 bg-white/20 mx-0.5" />
        </>
      )}

      {/* Position Libre (Canva / Absolue) */}
      <button
        type="button"
        onClick={toggleFreePosition}
        title={
          isFreePosition
            ? "Position libre active (Style Canva) : Cliquez pour ancrer dans le flux normal"
            : "Activer la position libre (Style Canva) : Déplacez cet élément où vous voulez"
        }
        className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all text-[11px] font-bold ${
          isFreePosition
            ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-xs animate-pulse'
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        <Move className="w-3 h-3 text-white" />
        <span>{isFreePosition ? '✦ Libre' : 'Libre'}</span>
      </button>

      {isFreePosition && (
        <button
          type="button"
          onClick={centerElementInContainer}
          title="Centrer horizontalement dans le conteneur"
          className="px-1.5 py-1 rounded-lg hover:bg-white/20 text-white text-[10px] font-semibold transition-colors"
        >
          Centrer
        </button>
      )}

      <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

      {/* Monter / Descendre */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          moveElementOrder(element.id, 'up');
        }}
        title="Monter dans la page"
        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
      >
        <ArrowUp className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          moveElementOrder(element.id, 'down');
        }}
        title="Descendre dans la page"
        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
      >
        <ArrowDown className="w-3.5 h-3.5" />
      </button>

      {/* Ajouter un comportement logique */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          addBehaviorForElement(element.id);
        }}
        title="Ajouter un comportement interactif (Logique)"
        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#5B5BF0] hover:bg-[#4E4ED8] text-white transition-colors text-[11px] font-bold"
      >
        <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
        <span>Comportement</span>
      </button>

      <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

      {/* Dupliquer */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          duplicateElement(element.id);
        }}
        title="Dupliquer (Ctrl+D)"
        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      {/* Verrouiller */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          lockElement(element.id);
        }}
        title={element.locked ? 'Déverrouiller' : 'Verrouiller'}
        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
      >
        {element.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
      </button>

      {/* Masquer */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          hideElement(element.id);
        }}
        title="Masquer l’élément"
        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
      >
        <EyeOff className="w-3.5 h-3.5" />
      </button>

      {/* Supprimer */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          deleteElement(element.id);
        }}
        title="Supprimer (Suppr)"
        className="p-1.5 rounded-lg hover:bg-red-500 hover:text-white text-red-400 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
