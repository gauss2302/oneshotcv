/**
 * Template specification types.
 *
 * A `TemplateSpec` is a renderer-agnostic, structured description of a CV.
 * It is consumed by the React-PDF renderer (this module) and could later also
 * be used to drive the HTML preview (single source of truth across renderers).
 *
 * The spec only describes WHAT to render (data + visual choices). The HOW
 * (layout, fonts, colors) lives in the renderer components.
 */

import { CVDesignSettings } from "@/types/cv";

// =============================================================================
// Primitives
// =============================================================================

export type IconKey =
  | "mail"
  | "phone"
  | "map-pin"
  | "globe"
  | "linkedin"
  | "github"
  | "graduation-cap"
  | "briefcase"
  | "code"
  | "rocket"
  | "award"
  | "calendar";

export interface ContactSpec {
  /** Optional icon key — renderer maps to its own icon set */
  icon?: IconKey;
  /** Optional inline label like "Email:" — kept short */
  label?: string;
  /** The actual contact value */
  value: string;
}

export interface PhotoSpec {
  url: string;
  /** Visual frame shape */
  shape: "circle" | "rounded" | "square";
  /** Side length in points (1 pt = 1/72 inch). PDF unit. */
  sizePt: number;
  /** Optional border color */
  borderColor?: string;
  borderWidthPt?: number;
}

// =============================================================================
// Header
// =============================================================================

export type HeaderVariant =
  /** Centered name + title + contacts. Classic look (Classic, Minimalist, Elegant, Academic, Creative). */
  | "centered"
  /** Name + title left, contacts left underneath. (Professional, Modern-Minimalist) */
  | "left-aligned"
  /** Photo on one side, text on the other. (Modern, Tech, Startup, Compact) */
  | "split-with-photo"
  /** Bordered box around the entire header. (Executive) */
  | "boxed"
  /** Solid colored banner background w/ inverse text. (Bold, Creative, Designer) */
  | "banner"
  /** Two-line accent bar + name. (Corporate) */
  | "underlined";

export interface HeaderSpec {
  variant: HeaderVariant;
  fullName: string;
  title: string;
  contacts: ContactSpec[];
  photo?: PhotoSpec;
  /** Solid background color for `banner` variant */
  backgroundColor?: string;
  /** Foreground text color override (banner uses white) */
  textColor?: string;
  /** Color of the accent line/bar/border */
  accentColor: string;
}

// =============================================================================
// Section title
// =============================================================================

export type SectionTitleVariant =
  /** Underline below the title text. (Classic, Minimalist, Professional, Academic) */
  | "underline"
  /** Uppercase, optional letter-spacing, no underline. (Sidebar, Designer, Bold) */
  | "uppercase"
  /** Solid filled bar with title inside. (Corporate banner-like) */
  | "filled-bar"
  /** Title surrounded by dividing rules on each side. (Modern) */
  | "ruled"
  /** Plain bold heading. (Compact, Tech, Startup) */
  | "minimal"
  /** Title with an icon prefix. (Tech, Startup, Corporate) */
  | "icon-prefixed";

export interface SectionTitleSpec {
  variant: SectionTitleVariant;
  label: string;
  icon?: IconKey;
  /** Color override; defaults to `accentColor` */
  color?: string;
  /** When true, render in uppercase regardless of variant default */
  uppercase?: boolean;
}

// =============================================================================
// Items
// =============================================================================

export interface SummaryItemSpec {
  type: "summary";
  text: string;
  /** Italic styling (Modern uses italic quote-style summaries) */
  italic?: boolean;
  /** When true, justify the paragraph (Academic, Executive) */
  justify?: boolean;
}

export interface ExperienceItemSpec {
  type: "experience";
  position: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface EducationItemSpec {
  type: "education";
  institution: string;
  degree: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  /**
   * Whether to show degree first vs institution first.
   * Most templates show institution first; Academic-style CVs put the degree first.
   */
  degreeFirst?: boolean;
}

export type SkillsLayout =
  /** Rounded pills wrapped horizontally. */
  | "pills"
  /** Flat list, comma-separated text. */
  | "inline"
  /** Two- or three-column grid of skills. */
  | "grid"
  /** Bulleted list. */
  | "list"
  /** Each skill with a 5-segment level bar. */
  | "rated";

export interface SkillsItemSpec {
  type: "skills";
  layout: SkillsLayout;
  items: { name: string; level?: number }[];
  /** Pills/grid style: filled background or outlined border */
  style?: "filled" | "outlined" | "soft";
}

export type ItemSpec =
  | SummaryItemSpec
  | ExperienceItemSpec
  | EducationItemSpec
  | SkillsItemSpec;

// =============================================================================
// Section
// =============================================================================

export interface SectionSpec {
  /** Stable id, used for keys */
  id: string;
  /** Optional title; if omitted the items render directly (e.g. summary blocks) */
  title?: SectionTitleSpec;
  items: ItemSpec[];
}

// =============================================================================
// Sidebar / Banner
// =============================================================================

export interface SidebarSpec {
  /** Width as a fraction of the page content area (0–1). e.g. 0.30 = 30%. */
  widthFraction: number;
  background: string;
  textColor: string;
  /** Where to render contacts; null/undefined = main column */
  contactsLocation?: "sidebar" | "main";
  /** Where to render photo; null/undefined = main column */
  photoLocation?: "sidebar" | "main";
  /** Skills section moved into sidebar */
  skillsInSidebar?: boolean;
  /** Optional extra sections nested in the sidebar */
  extraSections?: SectionSpec[];
}

export interface BannerSpec {
  /** Page-width colored band height in points */
  heightPt: number;
  background: string;
  textColor: string;
  /** Banner content alignment */
  align: "left" | "center" | "right";
  /** Whether banner repeats on every page (default true for sidebar layouts) */
  repeatOnEveryPage?: boolean;
}

// =============================================================================
// Theme
// =============================================================================

export interface ThemeSpec {
  /** Primary accent colour (used for headings, separators, links) */
  accentColor: string;
  /** Body text color */
  textColor: string;
  /** Muted text color (dates, locations, captions) */
  mutedColor: string;
  /** Optional secondary accent (badges, soft backgrounds) */
  secondaryColor?: string;
  /** Page background; almost always white */
  backgroundColor: string;
  /** Font family choice — maps to React-PDF standard fonts */
  fontFamily: "sans" | "serif" | "mono" | "times";
  /** Body font size in points (typical: 10–11pt for resumes) */
  baseFontSizePt: number;
  /** Multiplier applied to all font sizes (from designSettings.scale) */
  scale: number;
  /** Body line height (e.g. 1.4) */
  lineHeight: number;
  /** Default text alignment */
  textAlign: "left" | "center" | "right" | "justify";
  /** Vertical gap below sections, in points */
  sectionGapPt: number;
  /** Vertical gap between items inside a section, in points */
  itemGapPt: number;
}

// =============================================================================
// Page
// =============================================================================

export interface PageMargins {
  topPt: number;
  rightPt: number;
  bottomPt: number;
  leftPt: number;
}

// =============================================================================
// Top-level template spec
// =============================================================================

export interface TemplateSpec {
  /** Stable template id, e.g. "classic" */
  id: string;
  /** Human-readable label, e.g. "Classic" */
  label: string;
  layout: "single-column" | "sidebar-left" | "sidebar-right";
  theme: ThemeSpec;
  margins: PageMargins;
  header: HeaderSpec;
  sections: SectionSpec[];
  sidebar?: SidebarSpec;
  banner?: BannerSpec;
  footer?: { text: string };
}

// =============================================================================
// Builder signature
// =============================================================================

export interface SpecInput {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  photo?: { url: string };
  experience: Array<{
    id: string;
    position: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    current?: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    current?: boolean;
    description: string;
  }>;
  skills: Array<{ id: string; name: string; level: number }>;
  designSettings: CVDesignSettings;
}

export type SpecBuilder = (input: SpecInput) => TemplateSpec;
