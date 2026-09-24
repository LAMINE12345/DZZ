'use client';

import * as React from 'react';
import { Handle, Position, HandleProps } from '@xyflow/react';
import { ChevronRight } from 'lucide-react';

interface FlowHandleProps extends Omit<HandleProps, 'type' | 'position'> {
  type: 'source' | 'target';
  position: Position;
  label?: string;
}

export function FlowHandle({ type, position, label, ...props }: FlowHandleProps) {
  const isSource = type === 'source';

  return (
    <div
      className={`relative flex items-center group/handle ${
        isSource ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isSource && label && (
        <span className="text-[10px] font-mono font-medium text-neutral-600 dark:text-neutral-400 pl-2 select-none pointer-events-none uppercase tracking-wider">
          {label}
        </span>
      )}

      <Handle
        type={type}
        position={position}
        {...props}
        className="!w-3.5 !h-3.5 !rounded-xs !bg-[#0047FF] !border !border-white dark:!border-[#121215] !flex !items-center !justify-center !transition-transform group-hover/handle:!scale-125 !shadow-xs !cursor-crosshair"
      >
        <ChevronRight className="w-2.5 h-2.5 text-white stroke-[3] pointer-events-none -ml-0.5" />
      </Handle>

      {isSource && label && (
        <span className="text-[10px] font-mono font-medium text-neutral-600 dark:text-neutral-400 pr-2 select-none pointer-events-none uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}
