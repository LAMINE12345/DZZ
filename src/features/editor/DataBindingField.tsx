'use client';

import * as React from 'react';
import { Element } from '@/src/core/types';
import { useAppStore } from '@/src/core/store';
import { Database, X } from 'lucide-react';

interface DataBindingFieldProps {
  element: Element;
  propKey: string;
  label?: string;
  allowedTypes?: string[];
}

export function DataBindingField({
  element,
  propKey,
  label = 'Lier à une donnée',
  allowedTypes,
}: DataBindingFieldProps) {
  const { project, bindElementProp, unbindElementProp } = useAppStore();
  const currentBinding = element.bindings?.[propKey];

  const collections = project.collections || [];
  const fields = collections.flatMap((c) =>
    (c.fields || []).map((f) => ({
      collectionId: c.id,
      collectionName: c.name,
      fieldKey: f.key || f.name.toLowerCase(),
      fieldName: f.name,
      fieldType: f.type,
      fullKey: `item.${f.key || f.name.toLowerCase()}`,
    }))
  );

  const filteredFields = allowedTypes
    ? fields.filter((f) => allowedTypes.includes(f.fieldType))
    : fields;

  if (fields.length === 0) return null;

  return (
    <div className="mt-1.5 pt-1.5 border-t border-black/5 dark:border-white/5">
      <div className="flex items-center justify-between gap-1 text-[11px]">
        <span className="flex items-center gap-1 text-[#5B5BF0] dark:text-[#7D7DF8] font-medium">
          <Database className="w-3 h-3" />
          <span>{label}</span>
        </span>

        {currentBinding ? (
          <div className="flex items-center gap-1 bg-[#EEF0FE] dark:bg-[#282846] text-[#5B5BF0] dark:text-[#7D7DF8] px-1.5 py-0.5 rounded-md text-[10px] font-mono">
            <span className="truncate max-w-[100px]">{currentBinding}</span>
            <button
              type="button"
              onClick={() => unbindElementProp(element.id, propKey)}
              className="hover:text-red-500 cursor-pointer"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ) : (
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                bindElementProp(element.id, propKey, e.target.value);
              }
            }}
            className="text-[10px] bg-transparent text-[#8E8EA6] hover:text-[#5B5BF0] cursor-pointer outline-none max-w-[120px]"
          >
            <option value="">Lier au CMS…</option>
            {filteredFields.map((f) => (
              <option key={f.fullKey} value={f.fullKey}>
                {f.collectionName} → {f.fieldName}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
