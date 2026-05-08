import React from 'react';
import { CVState, CVDesignSettings } from '@/types/cv';

/**
 * Hint to the paginator about how this block wants to be split between pages.
 * - "section-title": tries to stay attached to the next block on the same page
 *   (avoids orphaning a title at the bottom of a page).
 * - "section-item":  a single item that should not be split mid-block when
 *   possible.
 * - "atomic":        block must never be split or moved (e.g., header).
 * - "footer":        always last on the final page; never repeated.
 * - "default":       no special hint.
 */
export type BlockKind =
  | "default"
  | "section-title"
  | "section-item"
  | "atomic"
  | "footer";

export interface TemplateBlock {
  id: string;
  content: React.ReactNode;
  /** Pagination hint. Optional — defaults to "default". */
  kind?: BlockKind;
}

/**
 * Optional metadata describing a non-flow layout fixture (sidebar, banner)
 * that must be rendered on every page (or on the first page only) outside the
 * normal block flow.
 *
 * Templates that need a colored sidebar or a banner header should return this
 * via `TemplateOutput` instead of trying to inject `position: absolute` markup
 * inside a block (which only renders on the first page).
 */
export interface TemplateLayout {
  kind: "single-column" | "sidebar-left" | "sidebar-right" | "header-banner";
  sidebar?: {
    /** CSS width, e.g. "30%" or "240px" */
    width: string;
    /** Background color of the sidebar column */
    background: string;
    /** Foreground color used for the sidebar content (passed via CSS var) */
    color?: string;
    /** Content rendered inside the sidebar on every page */
    content: React.ReactNode;
  };
  banner?: {
    /** Height in pixels reserved at the top of the content area */
    height: number;
    /** Content rendered inside the banner */
    content: React.ReactNode;
    /** If true, banner repeats on every page; otherwise only the first page */
    repeatOnEveryPage?: boolean;
  };
  /** Inline style applied to the `.cv-page` element (e.g., font color baseline) */
  pageStyle?: React.CSSProperties;
}

export interface TemplateOutput {
  blocks: TemplateBlock[];
  layout?: TemplateLayout;
}

/**
 * Templates may return either a plain array of blocks (single-column, simple
 * case) or a `TemplateOutput` object with optional layout metadata.
 * The CVPreview layer normalizes both forms.
 */
export type TemplateGenerator = (
  data: CVState,
  settings: CVDesignSettings,
) => TemplateBlock[] | TemplateOutput;
