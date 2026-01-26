/**
 * Template Color Constants
 * 
 * Shared color definitions for CV templates.
 * These reference design tokens for consistency.
 */

// Import design tokens for reference
import { colors as designTokens } from '@/lib/design-tokens';

/**
 * Standard template colors based on design tokens
 * These ensure consistency across all CV templates
 */
export const templateColors = {
  // Text colors (from design tokens)
  textMain: designTokens.foreground.primary,      // #111827 (gray-900)
  textSec: designTokens.foreground.secondary,    // #4b5563 (gray-600)
  textMuted: designTokens.foreground.tertiary,   // #6b7280 (gray-500)
  
  // Border colors
  border: designTokens.foreground.primary,       // #111827 (gray-900) - Dark borders
  borderLight: designTokens.border.default,      // #e5e7eb (gray-200) - Light borders
  borderMedium: designTokens.border.medium,       // #d1d5db (gray-300) - Medium borders
  
  // Background colors
  bgBadge: designTokens.background.tertiary,      // #f3f4f6 (gray-100)
  bgLight: designTokens.background.secondary,    // #f9fafb (gray-50)
  bgWhite: designTokens.background.primary,      // #ffffff
  
  // Semantic colors (for templates that need them)
  success: designTokens.semantic.success,        // #10b981
  error: designTokens.semantic.error,            // #ef4444
  warning: designTokens.semantic.warning,        // #f59e0b
  info: designTokens.semantic.info,              // #3b82f6
} as const;

/**
 * Legacy color object for backward compatibility
 * @deprecated Use templateColors instead
 */
export const colors = {
  textMain: templateColors.textMain,
  textSec: templateColors.textSec,
  textMuted: templateColors.textMuted,
  border: templateColors.border,
  borderLight: templateColors.borderLight,
  bgBadge: templateColors.bgBadge,
} as const;
