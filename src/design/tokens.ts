/**
 * Design System Tokens
 * Aurora-inspired liquid glass theme with blue-violet-lilac gradient
 */

export const colors = {
  // Aurora Accent Set
  aurora: {
    blue: '#5AA6FF',
    blueDark: '#4A96EF',
    blueLight: '#6BB3FF',
    violet: '#8B7CFF',
    violetDark: '#7B6CEF',
    lilac: '#B08CFF',
  },

  // Neutral Colors (Cool Whites)
  neutral: {
    white: '#FFFFFF',
    50: '#F9FBFF',
    100: '#F0F7FF',
    150: '#E8F2FF',
    200: '#E0ECFF',
    300: '#D4DFE8',
    400: '#C7D2E1',
    500: '#94A3B8',
    600: '#64748B',
    700: '#475569',
    800: '#334155',
    900: '#0F172A',
  },

  // Semantic Colors with enhanced contrast
  semantic: {
    success: '#06B6D4',
    successDark: '#0891B2',
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

// Glass effect presets - CRISP & SHARP
export const glass = {
  light: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(249,251,255,0.88) 100%)',
    backdropFilter: 'blur(8px) saturate(160%)',
    border: '1px solid rgba(90,166,255,0.14)',
  },
  standard: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,251,255,0.92) 100%)',
    backdropFilter: 'blur(12px) saturate(180%) brightness(1.08)',
    border: '1px solid rgba(90,166,255,0.18)',
  },
  premium: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(249,251,255,0.94) 100%)',
    backdropFilter: 'blur(16px) saturate(200%) brightness(1.12)',
    border: '1px solid rgba(90,166,255,0.24)',
  },
  ultra: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(249,251,255,0.96) 100%)',
    backdropFilter: 'blur(20px) saturate(210%) brightness(1.15)',
    border: '1px solid rgba(90,166,255,0.28)',
  },
} as const;

// Gradient presets
export const gradients = {
  aurora: 'linear-gradient(135deg, #5AA6FF 0%, #8B7CFF 50%, #B08CFF 100%)',
  auroraAccent: 'linear-gradient(135deg, #5AA6FF 0%, #B08CFF 100%)',
  success: 'linear-gradient(135deg, #06B6D4 0%, #14B8A6 100%)',
  subtle: 'linear-gradient(135deg, #F9FBFF 0%, #F0F7FF 100%)',
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

