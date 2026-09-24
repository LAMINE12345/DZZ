'use client';

import * as React from 'react';
import { LOGIC_CATALOG } from './catalog';
import { LogicNodeDefinition, CATEGORY_COLORS, NodeCategory } from './types';
import { Modal, Button } from '@/src/shared/ui';
import { useAppStore } from '@/src/core/store';
import {
  Search,
  Sparkles,
  Zap,
  PlayCircle,
  MousePointerClick,
  Hand,
  TextCursorInput,
  Send,
  Clock,
  ArrowDownCircle,
  Eye,
  Type,
  Palette,
  FileSymlink,
  ExternalLink,
  BellRing,
  Globe,
  DatabaseZap,
  FileEdit,
  Trash2,
  GitBranch,
  Scale,
  Network,
  Hourglass,
  RotateCw,
  ListOrdered,
  Variable,
  HardDriveDownload,
  HardDriveUpload,
  ScanLine,
  Layers2,
  Pilcrow,
  Binary,
  ToggleRight,
  Calculator,
  FileText,
  CalendarClock,
  Terminal,
  StickyNote,
  BoxSelect,
  Copy,
  MousePointer,
  CreditCard,
  Table,
  Database,
  FileSpreadsheet,
} from 'lucide-react';

const iconCatalog: Record<string, React.ComponentType<{ className?: string }>> = {
  PlayCircle,
  MousePointerClick,
  MousePointer,
  Hand,
  TextCursorInput,
  Send,
  Clock,
  ArrowDownCircle,
  Eye,
  Type,
  Palette,
  FileSymlink,
  ExternalLink,
  BellRing,
  Globe,
  DatabaseZap,
  FileEdit,
  Trash2,
  GitBranch,
  Scale,
  Network,
  Hourglass,
  RotateCw,
  ListOrdered,
  Variable,
  HardDriveDownload,
  HardDriveUpload,
  ScanLine,
  Layers2,
  Pilcrow,
  Binary,
  ToggleRight,
  Calculator,
  FileText,
  CalendarClock,
  Terminal,
  StickyNote,
  BoxSelect,
  Sparkles,
  Zap,
  Copy,
  CreditCard,
  Table,
  Database,
  FileSpreadsheet,
};

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (definition: LogicNodeDefinition) => void;
  initialCategory?: string;
}

export function AddNodeModal({
  isOpen,
  onClose,
  onSelectNode,
  initialCategory = 'all',
}: AddNodeModalProps) {
  const { experienceMode } = useAppStore();
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<string>(initialCategory);

  const categories = [
    { id: 'all', label: 'Tous les blocs', color: '#0A0A0C' },
    { id: 'event', label: 'Événements', color: '#FF2D20' },
    { id: 'action', label: 'Actions', color: '#0047FF' },
    { id: 'logic', label: 'Logique', color: '#059669' },
    { id: 'data', label: 'Données', color: '#D97706' },
    { id: 'tool', label: 'Outils', color: '#475569' },
    { id: 'comment', label: 'Notes & Groupes', color: '#18181B' },
  ];

  // Nœuds réservés au Mode Avancé pour garder le mode simple ultra fluide
  const advancedOnlyNodeTypes = new Set([
    'tool_console_log',
    'logic_boolean_op',
    'tool_calculator',
    'data_transform_format',
  ]);

  const filteredNodes = React.useMemo(() => {
    return LOGIC_CATALOG.filter((node) => {
      // En mode simple, masquer les blocs très techniques réservés au mode avancé
      if (experienceMode === 'simple' && advancedOnlyNodeTypes.has(node.type)) {
        return false;
      }

      const matchCat =
        activeCategory === 'all' ||
        (activeCategory === 'comment'
          ? node.category === 'comment' || node.category === 'group'
          : node.category === activeCategory);

      if (!matchCat) return false;

      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        node.name.toLowerCase().includes(term) ||
        node.description.toLowerCase().includes(term) ||
        node.category.toLowerCase().includes(term)
      );
    });
  }, [activeCategory, search, experienceMode]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter une brique logique"
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8EA6]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par action : clic, texte, message, condition, calcul..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F7F7FA] dark:bg-[#181824] rounded-xl border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none focus:border-[#5B5BF0] shadow-inner"
            autoFocus
          />
        </div>

        {/* Filtres de catégorie */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#5B5BF0] text-white shadow-xs'
                    : 'bg-[#F1F1F6] dark:bg-[#1E1E2C] text-[#62627A] dark:text-[#A5A5BC] hover:bg-[#EAEAF2] dark:hover:bg-[#252538]'
                }`}
              >
                {cat.id !== 'all' && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grille des blocs */}
        <div className="max-h-[380px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1">
          {filteredNodes.length === 0 ? (
            <div className="col-span-2 py-10 text-center text-xs text-[#8E8EA6]">
              Aucune brique ne correspond à votre recherche « {search} ».
            </div>
          ) : (
            filteredNodes.map((def) => {
              const IconComp = iconCatalog[def.iconName] || Sparkles;
              const catColor = CATEGORY_COLORS[def.category] || CATEGORY_COLORS.action;

              return (
                <button
                  key={def.type}
                  type="button"
                  onClick={() => {
                    onSelectNode(def);
                    onClose();
                  }}
                  className="group flex flex-col items-start text-left p-3 rounded-xl border border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#181824] hover:border-[#5B5BF0] dark:hover:border-[#6B6BF7] hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 bottom-0 w-1 rounded-l-xl"
                    style={{ backgroundColor: catColor.primary }}
                  />

                  <div className="flex items-center gap-2 w-full pl-1">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: catColor.lightBg,
                        color: catColor.primary,
                      }}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9] truncate">
                        {def.name}
                      </h4>
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider block"
                        style={{ color: catColor.primary }}
                      >
                        {def.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#62627A] dark:text-[#A5A5BC] line-clamp-2 mt-2 pl-1 leading-relaxed">
                    {def.description}
                  </p>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#E6E6EE] dark:border-[#28283C]">
          <span className="text-[11px] text-[#8E8EA6]">
            💡 Astuce : Vous pouvez aussi double-cliquer n’importe où sur le fond pour ouvrir ce menu.
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
