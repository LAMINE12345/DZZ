'use client';

import * as React from 'react';
import { runtime, RuntimeTraceFrame } from '@/src/core/runtime';
import { Button } from '@/src/shared/ui';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Bug,
  Activity,
  Variable,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DebugBarProps {
  onStepHighlight?: (nodeId: string | null) => void;
  onClose?: () => void;
}

export function DebugBar({ onStepHighlight, onClose }: DebugBarProps) {
  const [isRunning, setIsRunning] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [traces, setTraces] = React.useState<RuntimeTraceFrame[]>([]);
  const [isLogExpanded, setIsLogExpanded] = React.useState(false);
  const [memories, setMemories] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    runtime.setDebugMode(true);

    const unsubTrace = runtime.subscribeTrace((frame) => {
      setTraces((prev) => [...prev.slice(-30), frame]);
      if (frame.nodeId && onStepHighlight) {
        onStepHighlight(frame.nodeId);
      }
    });

    const unsubMem = runtime.subscribeMemory((key, val) => {
      setMemories((prev) => ({ ...prev, [key]: val }));
    });

    return () => {
      runtime.setDebugMode(false);
      unsubTrace();
      unsubMem();
      if (onStepHighlight) onStepHighlight(null);
    };
  }, [onStepHighlight]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    runtime.resume();
  };

  const handlePause = () => {
    setIsPaused(true);
    runtime.pause();
  };

  const handleStepNext = () => {
    runtime.stepNext();
  };

  const handleReset = () => {
    runtime.reset();
    setIsRunning(false);
    setIsPaused(false);
    setTraces([]);
    setMemories({});
    if (onStepHighlight) onStepHighlight(null);
  };

  const lastTrace = traces[traces.length - 1];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 max-w-2xl w-[92%]">
      {/* 1. Barre de contrôle principale */}
      <div className="flex items-center gap-2 p-2 bg-white/95 dark:bg-[#181824]/95 backdrop-blur-md rounded-2xl border-2 border-[#5B5BF0] shadow-2xl">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#5B5BF0]/10 text-[#5B5BF0] text-xs font-bold shrink-0">
          <Bug className="w-3.5 h-3.5" />
          <span>Débogueur Actif</span>
        </div>

        <div className="h-5 w-[1px] bg-[#E6E6EE] dark:bg-[#28283C]" />

        {/* Boutons de contrôle pas-à-pas */}
        <div className="flex items-center gap-1">
          {!isRunning || isPaused ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleStart}
              leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            >
              {isPaused ? 'Reprendre' : 'Exécuter'}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePause}
              leftIcon={<Pause className="w-3.5 h-3.5" />}
            >
              Pause
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleStepNext}
            leftIcon={<StepForward className="w-3.5 h-3.5 text-[#5B5BF0]" />}
            title="Avancer au bloc suivant"
          >
            Pas à pas
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            title="Réinitialiser l'état"
          />
        </div>

        <div className="h-5 w-[1px] bg-[#E6E6EE] dark:bg-[#28283C]" />

        {/* État du dernier bloc exécuté */}
        <div className="flex items-center gap-2 text-xs min-w-0 px-2 max-w-[200px]">
          <Activity className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="truncate font-mono text-[#62627A] dark:text-[#A5A5BC]">
            {lastTrace ? `${lastTrace.action} → ${lastTrace.target || 'page'}` : 'Prêt à simuler'}
          </span>
        </div>

        {/* Bouton pour dérouler la console */}
        <button
          type="button"
          onClick={() => setIsLogExpanded((v) => !v)}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#62627A] dark:text-[#A5A5BC] transition-colors"
          title="Afficher/Masquer le journal d'exécution"
        >
          {isLogExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Journal d'exécution et variables en mémoire (Déroulant) */}
      {isLogExpanded && (
        <div className="w-full bg-[#12121D]/95 text-white backdrop-blur-md rounded-2xl border border-[#28283C] p-3 shadow-2xl max-h-56 overflow-hidden flex flex-col gap-2 font-mono text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-[11px] text-[#A5A5BC]">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-[#10B981]" />
              <span>Journal en direct & Mémoires</span>
            </div>
            <span>{traces.length} opérations enregistrées</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto flex-1 p-1">
            {/* Colonne traces */}
            <div className="space-y-1">
              <div className="text-[10px] text-[#8E8EA6] uppercase tracking-wider font-bold">
                Flux d&apos;actions
              </div>
              {traces.length === 0 ? (
                <div className="text-[#62627A] italic text-[11px]">En attente d&apos;actions…</div>
              ) : (
                traces.slice(-6).map((t) => (
                  <div key={t.id} className="text-[11px] flex items-center gap-1.5 truncate">
                    <span className="text-[#10B981]">›</span>
                    <span className="text-[#A5A5BC]">{new Date(t.timestamp).toLocaleTimeString()}</span>
                    <strong className="text-[#5B5BF0] dark:text-[#7D7DF8]">{t.action}</strong>
                    <span className="text-white/80">{t.target}</span>
                  </div>
                ))
              )}
            </div>

            {/* Colonne Mémoires */}
            <div className="space-y-1 border-l border-white/10 pl-2">
              <div className="text-[10px] text-[#8E8EA6] uppercase tracking-wider font-bold flex items-center gap-1">
                <Variable className="w-3 h-3 text-[#F59E0B]" />
                <span>Mémoires actives</span>
              </div>
              {Object.keys(memories).length === 0 ? (
                <div className="text-[#62627A] italic text-[11px]">Aucune variable mémoire</div>
              ) : (
                Object.entries(memories).map(([k, v]) => (
                  <div key={k} className="text-[11px] flex items-center justify-between">
                    <span className="text-[#F59E0B]">{k}:</span>
                    <span className="text-[#34D399] font-bold">{JSON.stringify(v)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
