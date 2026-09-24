'use client';

import * as React from 'react';
import { useAppStore } from '@/src/core/store';
import { Element } from '@/src/core/types';
import { Modal, Button } from '@/src/shared/ui';
import {
  Heading,
  Type,
  Square,
  Image as ImageIcon,
  CheckSquare,
  FormInput,
  FolderTree,
  Check,
} from 'lucide-react';

interface ElementPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (elementId: string) => void;
  selectedId?: string;
  filterType?: string;
}

interface FlatElementInfo {
  id: string;
  type: string;
  customName?: string;
  previewText: string;
  depth: number;
}

function flattenTree(root: Element, depth = 0): FlatElementInfo[] {
  let result: FlatElementInfo[] = [];
  if (!root) return result;

  let textPreview = '';
  if (root.props?.text) textPreview = `"${root.props.text}"`;
  else if (root.props?.label) textPreview = `"${root.props.label}"`;
  else if (root.props?.placeholder) textPreview = `[${root.props.placeholder}]`;

  result.push({
    id: root.id,
    type: root.type,
    customName: root.customName,
    previewText: textPreview,
    depth,
  });

  if (root.children && root.children.length > 0) {
    root.children.forEach((child: Element) => {
      result = result.concat(flattenTree(child, depth + 1));
    });
  }
  return result;
}

export function ElementPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedId,
  filterType,
}: ElementPickerModalProps) {
  const { project, activePageId } = useAppStore();
  const [search, setSearch] = React.useState('');

  const activePage = project.pages.find((p) => p.id === activePageId) || project.pages[0];

  const allElements = React.useMemo(() => {
    if (!activePage?.root) return [];
    return flattenTree(activePage.root);
  }, [activePage]);

  const filtered = allElements.filter((el) => {
    if (filterType && el.type !== filterType) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      el.id.toLowerCase().includes(term) ||
      el.type.toLowerCase().includes(term) ||
      (el.customName && el.customName.toLowerCase().includes(term)) ||
      (el.previewText && el.previewText.toLowerCase().includes(term))
    );
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'heading':
        return <Heading className="w-4 h-4 text-[#5B5BF0]" />;
      case 'text':
        return <Type className="w-4 h-4 text-[#3B82F6]" />;
      case 'button':
        return <Square className="w-4 h-4 text-[#10B981]" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-[#EC4899]" />;
      case 'input':
        return <FormInput className="w-4 h-4 text-[#F59E0B]" />;
      case 'checkbox':
        return <CheckSquare className="w-4 h-4 text-[#14B8A6]" />;
      default:
        return <FolderTree className="w-4 h-4 text-[#8E8EA6]" />;
    }
  };

  const getTypeNameFr = (type: string) => {
    switch (type) {
      case 'heading':
        return 'Titre';
      case 'text':
        return 'Texte';
      case 'button':
        return 'Bouton';
      case 'image':
        return 'Image';
      case 'input':
        return 'Champ de saisie';
      case 'checkbox':
        return 'Case à cocher';
      case 'box':
        return 'Cadre / Conteneur';
      case 'section':
        return 'Section';
      default:
        return type;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choisir un élément sur la page"
      size="md"
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs text-[#62627A] dark:text-[#A5A5BC]">
          Sélectionnez directement le composant visuel de la page que cette brique logique doit cibler.
        </p>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou texte..."
          className="w-full px-3 py-2 text-xs bg-white dark:bg-[#181824] rounded-xl border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0]"
          autoFocus
        />

        <div className="max-h-[300px] overflow-y-auto space-y-1.5 p-1 border border-[#E6E6EE] dark:border-[#28283C] rounded-xl bg-[#FAFAFC] dark:bg-[#151520]">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8E8EA6]">
              Aucun élément trouvé sur cette page.
            </div>
          ) : (
            filtered.map((item) => {
              const isSel = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  className={`w-full text-left flex items-center justify-between p-2 rounded-lg transition-all text-xs ${
                    isSel
                      ? 'bg-[#5B5BF0] text-white shadow-xs'
                      : 'hover:bg-[#EEF0FE] dark:hover:bg-[#202035] text-[#1B1B2F] dark:text-[#F4F4F9]'
                  }`}
                  style={{ paddingLeft: `${Math.min(item.depth * 14 + 8, 48)}px` }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={isSel ? 'text-white' : ''}>{getIcon(item.type)}</span>
                    <span className="font-semibold">{item.customName || getTypeNameFr(item.type)}</span>
                    {item.previewText && (
                      <span
                        className={`truncate max-w-[200px] text-[11px] ${
                          isSel ? 'text-white/80' : 'text-[#62627A] dark:text-[#A5A5BC]'
                        }`}
                      >
                        {item.previewText}
                      </span>
                    )}
                  </div>

                  {isSel && <Check className="w-4 h-4 text-white shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </div>
    </Modal>
  );
}
