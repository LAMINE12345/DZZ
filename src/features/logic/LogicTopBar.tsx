'use client';

import * as React from 'react';
import { Play, Plus, BookOpen, AlertCircle, Code2, Bug } from 'lucide-react';
import { Button } from '@/src/shared/ui';

export interface LogicTopBarProps {
  onOpenAddNode?: () => void;
  onAddNode?: () => void;
  onOpenRecipes?: () => void;
  onToggleDiagnostics?: () => void;
  onOpenDiagnostics?: () => void;
  isDiagnosticsOpen?: boolean;
  onOpenCodeViewer?: () => void;
  onToggleDebug?: () => void;
  isDebugOpen?: boolean;
  onRunTest?: () => void;
  onRunSimulation?: () => void;
  isTesting?: boolean;
  isRunning?: boolean;
}

export function LogicTopBar({
  onOpenAddNode,
  onAddNode,
  onOpenRecipes,
  onToggleDiagnostics,
  onOpenDiagnostics,
  isDiagnosticsOpen,
  onOpenCodeViewer,
  onToggleDebug,
  isDebugOpen,
  onRunTest,
  onRunSimulation,
  isTesting,
  isRunning,
}: LogicTopBarProps) {
  const handleAddNode = onOpenAddNode || onAddNode;
  const handleDiagnostics = onToggleDiagnostics || onOpenDiagnostics;
  const handleTest = onRunTest || onRunSimulation;
  const activeTesting = isTesting || isRunning;

  return (
    <div className="h-12 bg-[#1E1E2E] border-b border-[#28283C] px-4 flex items-center justify-between select-none z-20">
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleAddNode} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Ajouter un Nœud
        </Button>
        {onOpenRecipes && (
          <Button size="sm" variant="outline" onClick={onOpenRecipes} leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
            Recettes
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {handleDiagnostics && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDiagnostics}
            className={isDiagnosticsOpen ? 'border-amber-500/50 bg-amber-500/10' : ''}
            leftIcon={<AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
          >
            Diagnostics
          </Button>
        )}
        {onToggleDebug && (
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleDebug}
            className={isDebugOpen ? 'border-[#5B5BF0] bg-[#5B5BF0]/10' : ''}
            leftIcon={<Bug className="w-3.5 h-3.5 text-[#5B5BF0]" />}
          >
            Débogueur
          </Button>
        )}
        {onOpenCodeViewer && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCodeViewer}
            leftIcon={<Code2 className="w-3.5 h-3.5 text-[#5B5BF0]" />}
          >
            Voir Code JS
          </Button>
        )}
        {handleTest && (
          <Button
            size="sm"
            onClick={handleTest}
            className={activeTesting ? 'bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}
            leftIcon={<Play className="w-3.5 h-3.5" />}
          >
            {activeTesting ? 'Simulation…' : 'Tester le Flux'}
          </Button>
        )}
      </div>
    </div>
  );
}
