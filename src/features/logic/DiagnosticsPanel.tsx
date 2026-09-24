'use client';

import * as React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export interface DiagnosticItem {
  id: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  nodeId?: string;
}

export interface DiagnosticsPanelProps {
  nodes?: any[];
  edges?: any[];
  onSelectNode?: (nodeId: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  diagnostics?: DiagnosticItem[];
}

export function DiagnosticsPanel({
  nodes = [],
  edges = [],
  onSelectNode,
  isOpen,
  onClose,
  diagnostics: explicitDiagnostics,
}: DiagnosticsPanelProps) {
  const diagnostics = React.useMemo(() => {
    if (explicitDiagnostics) return explicitDiagnostics;

    const list: DiagnosticItem[] = [];

    // Check disconnected nodes
    nodes.forEach((node) => {
      const isConnected = edges.some((e) => e.source === node.id || e.target === node.id);
      if (!isConnected && nodes.length > 1) {
        list.push({
          id: `disc-${node.id}`,
          nodeId: node.id,
          severity: 'warning',
          message: `Nœud « ${node.data?.label || node.type || node.id} » n'est connecté à aucun flux.`,
        });
      }
    });

    return list;
  }, [nodes, edges, explicitDiagnostics]);

  return (
    <div className="absolute top-4 right-4 w-80 bg-white dark:bg-[#181824] border border-[#E6E6EE] dark:border-[#28283C] rounded-2xl shadow-2xl z-30 p-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#E6E6EE] dark:border-[#28283C]">
        <h4 className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9] flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Diagnostics du Flux</span>
        </h4>
        {onClose && (
          <button type="button" onClick={onClose} className="text-[#8E8EA6] hover:text-[#1B1B2F] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="py-2 max-h-60 overflow-y-auto space-y-2">
        {diagnostics.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-[#10B981] p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Tous les nœuds et connexions sont valides.</span>
          </div>
        ) : (
          diagnostics.map((d) => (
            <div
              key={d.id}
              onClick={() => d.nodeId && onSelectNode && onSelectNode(d.nodeId)}
              className="p-2 rounded-xl bg-[#F7F7FA] dark:bg-[#202030] text-xs text-[#1B1B2F] dark:text-[#F4F4F9] cursor-pointer hover:border-[#5B5BF0] border border-transparent transition-all"
            >
              {d.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
