'use client';

import * as React from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { getNodeDefinition } from '../catalog';
import { CATEGORY_COLORS } from '../types';
import { FlowHandle } from '../customPorts/FlowHandle';
import { DataHandle } from '../customPorts/DataHandle';
import { ElementPickerModal } from '../ElementPickerModal';
import { useAppStore } from '@/src/core/store';
import { DidacticHelp } from '@/src/features/onboarding';
import {
  Trash2,
  Copy,
  MousePointer2,
  Sparkles,
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
  Sparkles,
  CreditCard,
  Table,
  Database,
  FileSpreadsheet,
};

export function BaseNode({ id, data, type, selected }: NodeProps) {
  const nodeData = data as Record<string, any>;
  const { project, activePageId } = useAppStore();
  const [isElementPickerOpen, setElementPickerOpen] = React.useState(false);
  const [editingFieldKey, setEditingFieldKey] = React.useState<string | null>(null);

  const def = getNodeDefinition(type);
  const category = def?.category || 'action';
  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.action;
  const IconComp = def ? iconCatalog[def.iconName] || Sparkles : Sparkles;

  const activePage = project.pages.find((p) => p.id === activePageId) || project.pages[0];

  // Helper pour trouver le nom lisible d'un élément
  const getElementName = (elId: string) => {
    if (!elId) return 'Choisir sur la page…';
    const findEl = (el: any): any => {
      if (!el) return null;
      if (el.id === elId) return el;
      if (el.children) {
        for (const c of el.children) {
          const res = findEl(c);
          if (res) return res;
        }
      }
      return null;
    };
    const found = activePage?.root ? findEl(activePage.root) : null;
    if (found) {
      return found.customName || `${found.type} (${found.props?.text || found.props?.label || found.id})`;
    }
    return elId;
  };

  const handleFieldChange = (key: string, value: any) => {
    if (typeof nodeData.onChange === 'function') {
      nodeData.onChange(id, { ...nodeData, [key]: value });
    }
  };

  return (
    <div
      className={`min-w-[250px] max-w-[320px] rounded-xs bg-white dark:bg-[#121215] border transition-all shadow-xs select-none relative overflow-hidden ${
        selected
          ? 'border-[#0A0A0C] dark:border-white ring-2 ring-neutral-900/30 dark:ring-white/30 shadow-md'
          : 'border-[#E2E4E8] dark:border-[#26272D] hover:border-neutral-400 dark:hover:border-neutral-600'
      }`}
    >
      {/* 1. Ligne d'accent suisse par catégorie */}
      <div className="h-[3px] w-full" style={{ backgroundColor: catColor.primary }} />

      {/* 2. Entête du Nœud avec typographie Suisse épurée */}
      <div className="px-3 py-2 bg-neutral-50/90 dark:bg-[#18191E] flex items-center justify-between gap-2 border-b border-[#E2E4E8] dark:border-[#26272D]">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-5 h-5 rounded-xs flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: catColor.primary, color: '#FFFFFF' }}
          >
            <IconComp className="w-3 h-3" />
          </div>
          <div className="min-w-0">
            <span
              className="text-[9px] font-mono font-bold uppercase tracking-widest block opacity-75"
              style={{ color: catColor.text }}
            >
              {category.toUpperCase()} · {def?.name || category}
            </span>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 tracking-tight truncate">
              {nodeData.label || def?.name || 'Bloc Logique'}
            </h4>
          </div>
        </div>

        {/* Actions sur le bloc & Bouton d'aide didactique */}
        <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
          <DidacticHelp
            title={def?.name || 'Bloc Logique'}
            explanation={def?.description || 'Ce bloc exécute une instruction automatique quand il reçoit un signal de flux.'}
            concreteExample={`Exemple : Dans un panier d'achat ou pour valider un formulaire sans écrire de script.`}
            animationType="bounce"
          />

          {typeof nodeData.onDuplicate === 'function' && (
            <button
              type="button"
              onClick={() => nodeData.onDuplicate(id)}
              className="w-5 h-5 rounded-xs flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Dupliquer ce bloc"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
          {typeof nodeData.onDelete === 'function' && (
            <button
              type="button"
              onClick={() => nodeData.onDelete(id)}
              className="w-5 h-5 rounded-xs flex items-center justify-center hover:bg-red-600 hover:text-white text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Supprimer ce bloc"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Ports & Corps du Nœud */}
      <div className="p-3 space-y-3">
        {/* Champs de configuration intégrés */}
        {def?.fields && def.fields.length > 0 && (
          <div className="space-y-2 pt-0.5">
            {def.fields.map((field) => {
              const val = nodeData[field.key] !== undefined ? nodeData[field.key] : field.defaultValue;

              if (field.type === 'elementPicker') {
                return (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                      <span>{field.label}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFieldKey(field.key);
                        setElementPickerOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xs border border-[#E2E4E8] dark:border-[#26272D] bg-[#F9FAFB] dark:bg-[#141519] hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors text-left"
                    >
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[180px]">
                        {getElementName(val)}
                      </span>
                      <MousePointer2 className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300 shrink-0" />
                    </button>
                  </div>
                );
              }

              if (field.type === 'pagePicker') {
                return (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {field.label}
                    </label>
                    <select
                      value={val || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xs border border-[#E2E4E8] dark:border-[#26272D] bg-[#F9FAFB] dark:bg-[#141519] text-xs font-medium text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-900 dark:focus:border-white"
                    >
                      <option value="">Sélectionner une page…</option>
                      {project.pages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.type === 'select') {
                return (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {field.label}
                    </label>
                    <select
                      value={val || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xs border border-[#E2E4E8] dark:border-[#26272D] bg-[#F9FAFB] dark:bg-[#141519] text-xs font-medium text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-900 dark:focus:border-white"
                    >
                      {field.options?.map((opt) => (
                        <option key={String(opt.value)} value={String(opt.value)}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.type === 'color') {
                return (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {field.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={val || '#0047FF'}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-7 h-7 rounded-xs cursor-pointer border border-[#E2E4E8] dark:border-[#26272D] bg-transparent p-0"
                      />
                      <input
                        type="text"
                        value={val || '#0047FF'}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="flex-1 px-2 py-1 rounded-xs border border-[#E2E4E8] dark:border-[#26272D] bg-[#F9FAFB] dark:bg-[#141519] text-xs font-mono text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-900 dark:focus:border-white"
                      />
                    </div>
                  </div>
                );
              }

              if (field.type === 'number') {
                return (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      value={val !== undefined ? val : ''}
                      onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-xs border border-[#E2E4E8] dark:border-[#26272D] bg-[#F9FAFB] dark:bg-[#141519] text-xs font-medium text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-900 dark:focus:border-white font-mono"
                    />
                  </div>
                );
              }

              if (field.type === 'boolean') {
                return (
                  <label key={field.key} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={Boolean(val)}
                      onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                      className="w-4 h-4 rounded-xs text-neutral-900 focus:ring-0 cursor-pointer accent-[#0047FF]"
                    />
                    <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                      {field.label}
                    </span>
                  </label>
                );
              }

              // Champ texte standard
              return (
                <div key={field.key} className="space-y-1">
                  <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={val !== undefined ? val : ''}
                    placeholder={field.placeholder}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xs border border-[#E2E4E8] dark:border-[#26272D] bg-[#F9FAFB] dark:bg-[#141519] text-xs font-medium text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Section des Ports (Entrées à gauche / Sorties à droite) */}
        <div className="flex justify-between items-start pt-1 gap-4">
          {/* Entrées */}
          <div className="flex flex-col gap-2.5 items-start">
            {def?.inputs.map((port) => {
              if (port.type === 'flow') {
                return (
                  <FlowHandle
                    key={port.id}
                    id={port.id}
                    type="target"
                    position={Position.Left}
                    label={port.label}
                  />
                );
              }
              return (
                <DataHandle
                  key={port.id}
                  id={port.id}
                  type="target"
                  position={Position.Left}
                  dataType={port.dataType}
                  label={port.label}
                />
              );
            })}
          </div>

          {/* Sorties */}
          <div className="flex flex-col gap-2.5 items-end ml-auto">
            {def?.outputs.map((port) => {
              if (port.type === 'flow') {
                return (
                  <FlowHandle
                    key={port.id}
                    id={port.id}
                    type="source"
                    position={Position.Right}
                    label={port.label}
                  />
                );
              }
              return (
                <DataHandle
                  key={port.id}
                  id={port.id}
                  type="source"
                  position={Position.Right}
                  dataType={port.dataType}
                  label={port.label}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Modale de sélection visuelle d'élément */}
      <ElementPickerModal
        isOpen={isElementPickerOpen}
        onClose={() => setElementPickerOpen(false)}
        selectedId={editingFieldKey ? nodeData[editingFieldKey] : undefined}
        onSelect={(elId) => {
          if (editingFieldKey) {
            handleFieldChange(editingFieldKey, elId);
          }
        }}
      />
    </div>
  );
}
