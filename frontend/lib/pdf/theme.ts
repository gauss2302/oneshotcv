/**
 * Theme + font resolution helpers shared across spec builders.
 *
 * React-PDF supports the PDF "Standard 14" fonts out of the box, no
 * registration needed:
 *   - Helvetica / Helvetica-Bold / Helvetica-Oblique / Helvetica-BoldOblique
 *   - Times-Roman / Times-Bold / Times-Italic / Times-BoldItalic
 *   - Courier / Courier-Bold / Courier-Oblique / Courier-BoldOblique
 *
 * We deliberately stick to these to avoid bundling font files (kilobytes per
 * weight) and to guarantee universal rendering across PDF readers + ATS.
 */

import { CVDesignSettings } from "@/types/cv";
import { ThemeSpec, PageMargins } from "./types";

/** Default A4 inner margins in points. 1 inch = 72 pt. */
export const DEFAULT_MARGINS: PageMargins = {
  topPt: 50,
  rightPt: 48,
  bottomPt: 50,
  leftPt: 48,
};

/** Tighter margins for dense templates. */
export const COMPACT_MARGINS: PageMargins = {
  topPt: 36,
  rightPt: 36,
  bottomPt: 36,
  leftPt: 36,
};

/** Base font sizes per template "feel" */
export const BASE_FONT_SIZES = {
  default: 10.5,
  compact: 9.5,
  executive: 11,
  academic: 11,
};

/** Standard text colors */
export const TEXT_COLORS = {
  primary: "#111827",
  secondary: "#374151",
  muted: "#6b7280",
  light: "#9ca3af",
  white: "#ffffff",
  border: "#e5e7eb",
};

/**
 * Resolve a Theme from the user's design settings + template-specific defaults.
 * Templates override individual fields as needed.
 */
export function buildTheme(
  designSettings: CVDesignSettings,
  overrides?: Partial<ThemeSpec>,
): ThemeSpec {
  const scale = designSettings.scale ?? 1;
  const lineHeight = designSettings.spacing?.lineHeight ?? 1.45;

  return {
    accentColor: designSettings.themeColor || "#DB4B2E",
    textColor: TEXT_COLORS.primary,
    mutedColor: TEXT_COLORS.muted,
    backgroundColor: TEXT_COLORS.white,
    fontFamily: designSettings.fontFamily ?? "sans",
    baseFontSizePt: BASE_FONT_SIZES.default,
    scale,
    // PDF readers handle line-heights well; clamp to sane range to avoid
    // exploding multi-page CVs.
    lineHeight: Math.min(Math.max(lineHeight, 1.2), 1.8),
    textAlign: designSettings.textAlignment ?? "left",
    sectionGapPt: 14 * Math.min(designSettings.spacing?.sectionPadding ?? 1, 1.4),
    itemGapPt: 8 * Math.min(designSettings.spacing?.itemGap ?? 1, 1.4),
    ...overrides,
  };
}

/** Map our `fontFamily` choice to PDF Standard 14 family name */
export function pdfFontFamily(family: ThemeSpec["fontFamily"]): {
  regular: string;
  bold: string;
  italic: string;
  boldItalic: string;
} {
  switch (family) {
    case "serif":
    case "times":
      return {
        regular: "Times-Roman",
        bold: "Times-Bold",
        italic: "Times-Italic",
        boldItalic: "Times-BoldItalic",
      };
    case "mono":
      return {
        regular: "Courier",
        bold: "Courier-Bold",
        italic: "Courier-Oblique",
        boldItalic: "Courier-BoldOblique",
      };
    case "sans":
    default:
      return {
        regular: "Helvetica",
        bold: "Helvetica-Bold",
        italic: "Helvetica-Oblique",
        boldItalic: "Helvetica-BoldOblique",
      };
  }
}

/** Compute scaled font size in points. */
export function fontSize(theme: ThemeSpec, multiplier: number): number {
  return theme.baseFontSizePt * theme.scale * multiplier;
}

/** Format a date range, respecting `current`. */
export function formatDateRange(
  startDate: string,
  endDate: string | undefined,
  current?: boolean,
): string {
  const end = current ? "Present" : endDate || "Present";
  if (!startDate && !end) return "";
  if (!startDate) return end;
  return `${startDate} – ${end}`;
}
