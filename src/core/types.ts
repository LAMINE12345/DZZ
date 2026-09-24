import { z } from 'zod';
import {
  ViewportModeSchema,
  NodeCategorySchema,
  ResponsiveStyleSchema,
  ElementSchema,
  NodeSchema,
  EdgeSchema,
  GraphSchema,
  MediaAssetSchema,
  CollectionFieldTypeSchema,
  CollectionFieldSchema,
  CollectionSchema,
  MemorySchema,
  PageSeoSchema,
  PageSchema,
  ProjectThemeSchema,
  IntegrationConfigSchema,
  I18nConfigSchema,
  ProjectSchema,
} from './schema';

export type ViewportMode = z.infer<typeof ViewportModeSchema>;
export type NodeCategory = z.infer<typeof NodeCategorySchema>;
export type ResponsiveStyle = z.infer<typeof ResponsiveStyleSchema>;
export type Element = {
  id: string;
  type: string;
  customName?: string;
  props: Record<string, any>;
  style: {
    desktop: Record<string, any>;
    tablet: Record<string, any>;
    mobile: Record<string, any>;
  };
  children: Element[];
  bindings?: Record<string, string>;
  locked?: boolean;
  hidden?: boolean;
};

export type LogicNode = z.infer<typeof NodeSchema>;
export type Node = LogicNode;
export type Edge = z.infer<typeof EdgeSchema>;
export type Graph = z.infer<typeof GraphSchema>;
export type MediaAsset = z.infer<typeof MediaAssetSchema>;
export type CollectionFieldType = z.infer<typeof CollectionFieldTypeSchema>;
export type CollectionField = z.infer<typeof CollectionFieldSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type Memory = z.infer<typeof MemorySchema>;
export type PageSeo = z.infer<typeof PageSeoSchema>;
export type Page = z.infer<typeof PageSchema>;
export type ProjectTheme = z.infer<typeof ProjectThemeSchema>;
export type IntegrationConfig = z.infer<typeof IntegrationConfigSchema>;
export type I18nConfig = z.infer<typeof I18nConfigSchema>;
export type Project = z.infer<typeof ProjectSchema>;

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}
