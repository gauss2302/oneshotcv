/**
 * Design Tokens for CV Builder Application
 * 
 * This file contains all design tokens used throughout the application.
 * Tokens are organized by category and can be used in both TypeScript/React
 * and CSS contexts.
 */

// ============================================================================
// Brand Colors
// ============================================================================

export const brandColors = {
  primary: {
    orange: '#FFA239',
    red: '#FF5656',
  },
  gradient: {
    from: '#FFA239',
    to: '#FF5656',
  },
} as const;

// ============================================================================
// Semantic Color Tokens
// ============================================================================

export const colors = {
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb', // gray-50
    tertiary: '#f3f4f6', // gray-100
    muted: '#f9fafb',
  },
  
  // Foreground colors
  foreground: {
    primary: '#111827', // gray-900
    secondary: '#4b5563', // gray-600
    tertiary: '#6b7280', // gray-500
    muted: '#9ca3af', // gray-400
    disabled: '#d1d5db', // gray-300
  },
  
  // Border colors
  border: {
    default: '#e5e7eb', // gray-200
    light: '#f3f4f6', // gray-100
    medium: '#d1d5db', // gray-300
    dark: '#9ca3af', // gray-400
  },
  
  // Accent colors (using brand gradient)
  accent: {
    primary: brandColors.primary.orange,
    secondary: brandColors.primary.red,
    gradient: `linear-gradient(to right, ${brandColors.gradient.from}, ${brandColors.gradient.to})`,
  },
  
  // Semantic colors
  semantic: {
    success: '#10b981', // green-500
    error: '#ef4444', // red-500
    warning: '#f59e0b', // amber-500
    info: '#3b82f6', // blue-500
  },
  
  // Interactive states
  interactive: {
    hover: {
      background: '#f9fafb', // gray-50
      foreground: '#111827', // gray-900
    },
    active: {
      background: '#f3f4f6', // gray-100
      foreground: '#111827', // gray-900
    },
    focus: {
      ring: brandColors.primary.orange,
      ringOffset: '#ffffff',
    },
  },
} as const;

// ============================================================================
// Typography Tokens
// ============================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  
  // Font sizes (rem-based)
  fontSize: {
    display: '3rem', // 48px
    h1: '2.25rem', // 36px
    h2: '1.875rem', // 30px
    h3: '1.5rem', // 24px
    h4: '1.25rem', // 20px
    bodyLarge: '1.125rem', // 18px
    body: '1rem', // 16px
    bodySmall: '0.875rem', // 14px
    caption: '0.75rem', // 12px
  },
  
  // Line heights
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Letter spacing
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
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
} as const;

// ============================================================================
// Border Radius Tokens
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem', // 32px
  full: '9999px',
} as const;

// ============================================================================
// Shadow Tokens
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  // Brand-specific shadow with orange tint
  brand: '0 4px 6px -1px rgb(255 162 57 / 0.25), 0 2px 4px -2px rgb(255 162 57 / 0.25)',
  brandLg: '0 10px 15px -3px rgb(255 162 57 / 0.25), 0 4px 6px -4px rgb(255 162 57 / 0.25)',
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
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// Breakpoint Tokens (for reference, Tailwind handles these)
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

/**
 * Get CSS variable name for a token
 */
export function getCSSVar(category: string, token: string): string {
  return `--${category}-${token}`;
}

/**
 * Get Tailwind class for spacing
 */
export function getSpacingClass(value: keyof typeof spacing): string {
  return `p-${value}`;
}

/**
 * Get gradient class for brand colors
 */
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
