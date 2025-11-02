/**
 * Design System Tokens
 * ChatGPT-inspired modern, clean, minimalist design
 */

export const colors = {
  // Primary Accent - Modern Teal/Green (ChatGPT-inspired)
  primary: {
    50: '#F0FDF9',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // Secondary Accent - Slate Blue
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Neutral Colors - Clean, minimal palette
  neutral: {
    white: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    150: '#F0F0F0',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic Colors with enhanced contrast
  semantic: {
    success: '#10B981',
    successDark: '#059669',
    warning: '#F59E0B',
    warningDark: '#D97706',
    danger: '#EF4444',
    dangerDark: '#DC2626',
    info: '#3B82F6',
    infoDark: '#2563EB',
  },

  // Insurance-Specific
  insurance: {
    riskHigh: '#5AA6FF',
    riskMedium: '#8B7CFF',
    riskLow: '#06B6D4',
    regulatory: '#5AA6FF',
    catastrophe: '#8B7CFF',
    market: '#5AA6FF',
    technology: '#B08CFF',
  },
} as const;

export const typography = {
  fontFamily: {
    system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
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
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.65,
    loose: 1.8,
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '-0.01em',
    wide: '0.01em',
  },
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
} as const;

export const radius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
} as const;

export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
  sm: '0 2px 4px 0 rgb(0 0 0 / 0.06)',
  md: '0 4px 8px -1px rgb(0 0 0 / 0.09), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
  lg: '0 12px 20px -3px rgb(0 0 0 / 0.12), 0 4px 8px -4px rgb(0 0 0 / 0.07)',
  xl: '0 24px 32px -5px rgb(0 0 0 / 0.14), 0 8px 12px -6px rgb(0 0 0 / 0.08)',
  '2xl': '0 28px 56px -12px rgb(0 0 0 / 0.18)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
  glow: '0 0 0 1px hsla(220, 90%, 66%, .35), 0 0 18px hsla(220, 90%, 66%, .35)',
} as const;

export const transitions = {
  fast: '120ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const blur = {
  sm: 'blur(8px)',
  md: 'blur(12px)',
  lg: 'blur(16px)',
  xl: 'blur(20px)',
  '2xl': 'blur(24px)',
} as const;

export const zIndex = {
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
} as const;

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
    },
    padding: {
      sm: '0.5rem 0.75rem',
      md: '0.625rem 1rem',
      lg: '0.75rem 1.5rem',
    },
  },
  input: {
    height: '40px',
    padding: '0.625rem 1rem',
    borderRadius: '0.5rem',
  },
  card: {
    padding: '1rem',
    borderRadius: '1rem',
  },
  tag: {
    padding: '0.375rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
  },
} as const;

// Glass effect presets - Modern, clean aesthetic
export const glass = {
  light: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(250,250,250,0.6) 100%)',
    backdropFilter: 'blur(8px) saturate(180%)',
    border: '1px solid rgba(0,0,0,0.06)',
  },
  standard: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(250,250,250,0.7) 100%)',
    backdropFilter: 'blur(12px) saturate(190%)',
    border: '1px solid rgba(0,0,0,0.08)',
  },
  premium: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,250,0.8) 100%)',
    backdropFilter: 'blur(16px) saturate(200%)',
    border: '1px solid rgba(0,0,0,0.1)',
  },
  ultra: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,250,0.9) 100%)',
    backdropFilter: 'blur(20px) saturate(210%)',
    border: '1px solid rgba(0,0,0,0.12)',
  },
} as const;

// Gradient presets - Modern, subtle
export const gradients = {
  primary: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
  primaryAccent: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  subtle: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
} as const;

export default {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
  blur,
  zIndex,
  breakpoints,
  components,
  glass,
  gradients,
} as const;

