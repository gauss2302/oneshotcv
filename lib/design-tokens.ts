/**
 * Design Tokens for CV Builder Application
 * Havamind Design System — ChronoTask style
 *
 * Tokens are organized by category and can be used in both TypeScript/React
 * and CSS contexts.
 */

// ============================================================================
// Brand Colors — Strawberry / Honeydew / Frosted Blue / Steel Blue / Deep Space
// ============================================================================

export const brandColors = {
  primary: '#457b9d',     /* Steel Blue */
  secondary: '#a8dadc',   /* Frosted Blue */
  accent: '#e63946',      /* Strawberry Red */
  honeydew: '#f1faee',
  deepSpace: '#1d3557',
  gradient: {
    from: '#457b9d',
    to: '#a8dadc',
  },
} as const;

// ============================================================================
// Semantic Color Tokens
// ============================================================================

export const colors = {
  // Background / Surfaces
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F4F6F8',
    muted: '#FAFAFA',
  },

  // Ink & text
  ink: '#1d3557',
  muted: '#457b9d',
  border: '#a8dadc',

  // Foreground (alias for compatibility)
  foreground: {
    primary: '#1d3557',
    secondary: '#457b9d',
    tertiary: '#6b7280',
    muted: '#9ca3af',
    disabled: '#d1d5db',
  },

  // Border colors
  borderColors: {
    default: '#a8dadc',
    light: '#e8f4f2',
    medium: '#d1d5db',
    dark: '#9ca3af',
  },

  // Accent
  accent: {
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    warm: brandColors.accent,
    gradient: `linear-gradient(to right, ${brandColors.gradient.from}, ${brandColors.gradient.to})`,
  },

  // Semantic colors
  semantic: {
    success: '#16A34A',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },

  // Interactive states
  interactive: {
    hover: {
      background: '#FAFAFA',
      foreground: '#111827',
    },
    active: {
      background: '#F4F6F8',
      foreground: '#111827',
    },
    focus: {
      ring: brandColors.primary,
      ringOffset: '#ffffff',
    },
  },
} as const;

// ============================================================================
// Typography Tokens (Havamind scale)
// ============================================================================

export const typography = {
  fontFamily: {
    display: 'var(--font-display), ui-sans-serif, system-ui, sans-serif',
    sans: 'var(--font-body), ui-sans-serif, system-ui, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },

  fontSize: {
    display: '3.5rem',
    displayMobile: '2.5rem',
    h1: '2.5rem',
    h1Mobile: '2rem',
    h2: '2rem',
    h2Mobile: '1.625rem',
    h3: '1.5rem',
    h3Mobile: '1.25rem',
    h4: '1.25rem',
    bodyLarge: '1.125rem',
    body: '1rem',
    bodySmall: '0.875rem',
    caption: '0.75rem',
    micro: '0.6875rem',
  },

  lineHeight: {
    display: '1.05',
    tight: '1.12',
    normal: '1.55',
    relaxed: '1.75',
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// ============================================================================
// Spacing Tokens (8px base unit)
// ============================================================================

export const spacing = {
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

// ============================================================================
// Border Radius Tokens (Havamind)
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '10px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
} as const;

// ============================================================================
// Shadow Tokens (soft, wide - Havamind)
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 6px 18px rgba(17, 24, 39, 0.06)',
  md: '0 14px 30px rgba(17, 24, 39, 0.08)',
  lg: '0 24px 50px rgba(17, 24, 39, 0.12)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  brand: '0 4px 6px -1px rgb(27 118 252 / 0.25), 0 2px 4px -2px rgb(27 118 252 / 0.25)',
  brandLg: '0 10px 15px -3px rgb(27 118 252 / 0.25), 0 4px 6px -4px rgb(27 118 252 / 0.25)',
} as const;

// ============================================================================
// Z-Index Tokens
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ============================================================================
// Transition Tokens
// ============================================================================

export const transitions = {
  duration: {
    fast: '120ms',
    normal: '160ms',
    slow: '220ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// Breakpoint Tokens
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

export function getCSSVar(category: string, token: string): string {
  return `--${category}-${token}`;
}

export function getSpacingClass(value: keyof typeof spacing): string {
  return `p-${value}`;
}

export function getBrandGradientClass(direction: 'r' | 'l' | 't' | 'b' = 'r'): string {
  const dirMap = {
    r: 'to-r',
    l: 'to-l',
    t: 'to-t',
    b: 'to-b',
  };
  return `bg-gradient-${dirMap[direction]} from-[${brandColors.gradient.from}] to-[${brandColors.gradient.to}]`;
}

// ============================================================================
// Type Exports
// ============================================================================

export type ColorToken = typeof colors;
export type TypographyToken = typeof typography;
export type SpacingToken = typeof spacing;
export type BorderRadiusToken = typeof borderRadius;
export type ShadowToken = typeof shadows;
