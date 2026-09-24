import { NodeCategory, Node, Edge } from '@/src/core/types';

export type { NodeCategory };

export type PortType = 'flow' | 'data';
export type DataType = 'text' | 'number' | 'boolean' | 'list' | 'element' | 'any';

export interface PortDefinition {
  id: string;
  name: string;
  type: PortType;
  dataType?: DataType;
  label: string;
  tooltip?: string;
  multiple?: boolean;
}

export interface LogicFieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'elementPicker' | 'pagePicker' | 'memoryPicker' | 'collectionPicker' | 'color';
  options?: Array<{ label: string; value: string | number | boolean }>;
  placeholder?: string;
  tooltip?: string;
  defaultValue?: any;
}

export interface LogicNodeDefinition {
  type: string;
  category: NodeCategory;
  name: string;
  description: string;
  iconName: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  fields?: LogicFieldDef[];
  defaultData: Record<string, any>;
}

export interface DiagnosticIssue {
  id: string;
  nodeId?: string;
  level: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  fixAction?: {
    label: string;
    action: () => void;
  };
}

export interface RecipeDefinition {
  id: string;
  name: string;
  description: string;
  badge: string;
  category: string;
  iconName: string;
  color: string;
  createGraph: (pageElements?: Array<{ id: string; name: string; type: string }>) => {
    name: string;
    nodes: Node[];
    edges: Edge[];
  };
}

export const DATA_TYPE_COLORS: Record<DataType, string> = {
  text: '#3B82F6',      // Bleu
  number: '#F59E0B',    // Ambre/Orange
  boolean: '#10B981',   // Vert
  list: '#8B5CF6',      // Violet
  element: '#EC4899',   // Rose
  any: '#14B8A6',       // Turquoise
};

export const DATA_TYPE_LABELS: Record<DataType, string> = {
  text: 'Texte',
  number: 'Nombre',
  boolean: 'Vrai/Faux',
  list: 'Liste',
  element: 'Élément',
  any: 'Universel',
};

export const CATEGORY_COLORS: Record<NodeCategory, { primary: string; lightBg: string; border: string; text: string }> = {
  event: {
    primary: '#FF2D20', // Swiss Vermilion Red
    lightBg: '#FFF1F0',
    border: '#FFA39E',
    text: '#CF1322',
  },
  action: {
    primary: '#0047FF', // Swiss International Cobalt
    lightBg: '#F0F5FF',
    border: '#ADC6FF',
    text: '#002C99',
  },
  logic: {
    primary: '#059669', // Emerald Precision
    lightBg: '#ECFDF5',
    border: '#A7F3D0',
    text: '#065F46',
  },
  data: {
    primary: '#D97706', // Architectural Amber
    lightBg: '#FFFBEB',
    border: '#FDE68A',
    text: '#92400E',
  },
  tool: {
    primary: '#475569', // Technical Slate
    lightBg: '#F8FAFC',
    border: '#CBD5E1',
    text: '#1E293B',
  },
  comment: {
    primary: '#B45309',
    lightBg: '#FEFCE8',
    border: '#FEF08A',
    text: '#713F12',
  },
  group: {
    primary: '#18181B', // Architectural Black
    lightBg: '#F4F4F5',
    border: '#E4E4E7',
    text: '#09090B',
  },
};
