'use client';

import * as React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';

export function DidacticHelp({
  title,
  explanation,
  concreteExample,
  animationType,
}: {
  title: string;
  explanation: string;
  concreteExample?: string;
  animationType?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-[#8E8EA6] hover:text-[#5B5BF0] p-0.5 rounded-full transition-colors"
        aria-label={title}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-[#1B1B2F] text-white text-[11px] leading-relaxed rounded-xl shadow-2xl z-50 pointer-events-none animate-in fade-in">
          <div className="font-bold text-[#14B8A6] flex items-center gap-1 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>{title}</span>
          </div>
          <p className="text-gray-300 mb-1.5">{explanation}</p>
          {concreteExample && (
            <div className="bg-white/10 p-1.5 rounded-lg text-[10px] text-gray-200 border-l-2 border-[#5B5BF0]">
              💡 {concreteExample}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function GlossaryTerm({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <span className="underline decoration-dotted decoration-[#5B5BF0] cursor-help" title={term}>
      {children}
    </span>
  );
}
