'use client';

import * as React from 'react';
import { Handle, Position, HandleProps } from '@xyflow/react';
import { DataType, DATA_TYPE_COLORS, DATA_TYPE_LABELS } from '../types';

interface DataHandleProps extends Omit<HandleProps, 'type' | 'position'> {
  type: 'source' | 'target';
  position: Position;
  dataType?: DataType;
  label?: string;
  tooltip?: string;
}

export function DataHandle({
  type,
  position,
  dataType = 'any',
  label,
  tooltip,
  ...props
}: DataHandleProps) {
  const isSource = type === 'source';
  const color = DATA_TYPE_COLORS[dataType] || '#14B8A6';
  const typeLabel = DATA_TYPE_LABELS[dataType] || 'Donnée';

  return (
    <div
      className={`relative flex items-center gap-1.5 group/dhandle ${
        isSource ? 'justify-end text-right' : 'justify-start text-left'
      }`}
      title={tooltip || `Donnée [${typeLabel}]`}
    >
      {!isSource && label && (
        <span className="text-[10px] font-mono font-medium text-neutral-600 dark:text-neutral-400 pl-2 select-none pointer-events-none truncate max-w-[120px]">
          {label}
        </span>
      )}

      <Handle
        type={type}
        position={position}
        {...props}
        style={{
          backgroundColor: color,
        }}
        className="!w-3 !h-3 !rounded-xs !border !border-white dark:!border-[#121215] !transition-transform group-hover/dhandle:!scale-125 !shadow-xs !cursor-crosshair"
      />

      {isSource && label && (
        <span className="text-[10px] font-mono font-medium text-neutral-600 dark:text-neutral-400 pr-2 select-none pointer-events-none truncate max-w-[120px]">
          {label}
        </span>
      )}
    </div>
  );
}
