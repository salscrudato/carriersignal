/**
 * Design System Theme
 * Centralized theme tokens for light and dark modes
 * Liquid glass aesthetic with Aurora accent colors
 */

export const THEME = {
  // ============================================================================
  // LIGHT MODE (Default)
  // ============================================================================
  light: {
    // Primary colors - Aurora blue-based
    primary: {
      50: '#F0F7FF',
      100: '#E0EFFE',
      200: '#C7D2E1',
      300: '#5AA6FF',
      400: '#4A96FF',
      500: '#3A86FF',
      600: '#2A76FF',
      700: '#1A66FF',
      800: '#0A56FF',
      900: '#0A3FCC',
    },

    // Accent colors - Aurora violet/pink
    accent: {
      violet: '#8B7CFF',
      pink: '#B08CFF',
      lilac: '#D4A5FF',
    },

    // Semantic colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Neutral colors - Cool whites
    neutral: {
      50: '#F9FBFF',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F9FBFF',
    backgroundTertiary: '#F3F4F6',

    // Borders
    border: '#C7D2E1',
    borderLight: 'rgba(199, 210, 225, 0.25)',

    // Text
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      tertiary: '#94A3B8',
      inverse: '#FFFFFF',
    },

    // Shadows - Subtle glow effects
    shadow: {
      sm: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
      md: '0 4px 6px -1px rgba(15, 23, 42, 0.1)',
      lg: '0 10px 15px -3px rgba(15, 23, 42, 0.1)',
      xl: '0 20px 25px -5px rgba(15, 23, 42, 0.1)',
      glow: '0 0 20px rgba(90, 166, 255, 0.3)',
    },

    // Gradients
    gradient: {
      primary: 'linear-gradient(135deg, #5AA6FF 0%, #8B7CFF 100%)',
      accent: 'linear-gradient(135deg, #8B7CFF 0%, #B08CFF 100%)',
      subtle: 'linear-gradient(135deg, #F9FBFF 0%, #F3F4F6 100%)',
    },
  },

  // ============================================================================
  // DARK MODE
  // ============================================================================
  dark: {
    // Primary colors - Aurora blue-based (adjusted for dark)
    primary: {
      50: '#0A1F3F',
      100: '#0F2E5C',
      200: '#1A4A8C',
      300: '#2A66FF',
      400: '#3A86FF',
      500: '#5AA6FF',
      600: '#7AB8FF',
      700: '#9ACAFF',
      800: '#BADCFF',
      900: '#E0EFFE',
    },

    // Accent colors - Aurora violet/pink (adjusted for dark)
    accent: {
      violet: '#B8A5FF',
      pink: '#D4B8FF',
      lilac: '#E8D4FF',
    },

    // Semantic colors
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',

    // Neutral colors - Cool darks
    neutral: {
      50: '#F9FBFF',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // Backgrounds
    background: '#0F172A',
    backgroundSecondary: '#1A2847',
    backgroundTertiary: '#253456',

    // Borders
    border: '#2A4A7C',
    borderLight: 'rgba(90, 166, 255, 0.15)',

    // Text
    text: {
      primary: '#F9FBFF',
      secondary: '#CBD5E1',
      tertiary: '#94A3B8',
      inverse: '#0F172A',
    },

    // Shadows - Subtle glow effects
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
      glow: '0 0 20px rgba(90, 166, 255, 0.2)',
    },

    // Gradients
    gradient: {
      primary: 'linear-gradient(135deg, #2A66FF 0%, #8B7CFF 100%)',
      accent: 'linear-gradient(135deg, #8B7CFF 0%, #B8A5FF 100%)',
      subtle: 'linear-gradient(135deg, #1A2847 0%, #253456 100%)',
    },
  },

  // ============================================================================
  // TYPOGRAPHY
  // ============================================================================
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // ============================================================================
  // SPACING
  // ============================================================================
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },

  // ============================================================================
  // BORDER RADIUS
  // ============================================================================
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    base: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },

  // ============================================================================
  // TRANSITIONS
  // ============================================================================
  transition: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },

  // ============================================================================
  // Z-INDEX
  // ============================================================================
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    backdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export type Theme = typeof THEME.light;
export type ThemeMode = 'light' | 'dark';

