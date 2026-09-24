import { ProjectTheme } from './types';

export interface ThemePreset {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  radius: number;
  buttonRadius: number;
  theme?: Partial<ProjectTheme>;
}

export interface FontOption {
  name: string;
  value: string;
  category: string;
}

export const HEADING_FONTS: FontOption[] = [
  { name: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans', category: 'Sans-Serif' },
  { name: 'Inter', value: 'Inter', category: 'Sans-Serif' },
  { name: 'Poppins', value: 'Poppins', category: 'Géométrique' },
  { name: 'Outfit', value: 'Outfit', category: 'Moderne' },
  { name: 'Playfair Display', value: 'Playfair Display', category: 'Serif' },
  { name: 'Cabinet Grotesk', value: 'Cabinet Grotesk', category: 'Display' },
  { name: 'Syne', value: 'Syne', category: 'Expressif' },
  { name: 'Clash Display', value: 'Clash Display', category: 'Display' },
  { name: 'General Sans', value: 'General Sans', category: 'Sans-Serif' },
  { name: 'Satoshi', value: 'Satoshi', category: 'Moderne' },
];

export const BODY_FONTS: FontOption[] = [
  { name: 'Inter', value: 'Inter', category: 'Sans-Serif' },
  { name: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans', category: 'Sans-Serif' },
  { name: 'Roboto', value: 'Roboto', category: 'Sans-Serif' },
  { name: 'Open Sans', value: 'Open Sans', category: 'Sans-Serif' },
  { name: 'DM Sans', value: 'DM Sans', category: 'Sans-Serif' },
  { name: 'Source Sans 3', value: 'Source Sans 3', category: 'Sans-Serif' },
  { name: 'Work Sans', value: 'Work Sans', category: 'Sans-Serif' },
  { name: 'Nunito', value: 'Nunito', category: 'Arrondi' },
];

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'modern-indigo',
    name: 'Indigo Studio',
    primaryColor: '#5B5BF0',
    accentColor: '#14B8A6',
    backgroundColor: '#F7F7FA',
    surfaceColor: '#FFFFFF',
    textColor: '#1B1B2F',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    radius: 12,
    buttonRadius: 10,
    theme: {
      primaryColor: '#5B5BF0',
      accentColor: '#14B8A6',
      backgroundColor: '#F7F7FA',
      surfaceColor: '#FFFFFF',
      textColor: '#1B1B2F',
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Inter',
      radius: 12,
      buttonRadius: 10,
    },
  },
  {
    id: 'emerald-clean',
    name: 'Émeraude Zen',
    primaryColor: '#059669',
    accentColor: '#10B981',
    backgroundColor: '#F0FDF4',
    surfaceColor: '#FFFFFF',
    textColor: '#064E3B',
    headingFont: 'Outfit',
    bodyFont: 'Inter',
    radius: 16,
    buttonRadius: 12,
    theme: {
      primaryColor: '#059669',
      accentColor: '#10B981',
      backgroundColor: '#F0FDF4',
      surfaceColor: '#FFFFFF',
      textColor: '#064E3B',
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      radius: 16,
      buttonRadius: 12,
    },
  },
  {
    id: 'dark-cyber',
    name: 'Cyber Sombre',
    primaryColor: '#8B5CF6',
    accentColor: '#EC4899',
    backgroundColor: '#0F172A',
    surfaceColor: '#1E293B',
    textColor: '#F8FAFC',
    headingFont: 'Cabinet Grotesk',
    bodyFont: 'Inter',
    radius: 8,
    buttonRadius: 6,
    theme: {
      primaryColor: '#8B5CF6',
      accentColor: '#EC4899',
      backgroundColor: '#0F172A',
      surfaceColor: '#1E293B',
      textColor: '#F8FAFC',
      headingFont: 'Cabinet Grotesk',
      bodyFont: 'Inter',
      radius: 8,
      buttonRadius: 6,
    },
  },
];
