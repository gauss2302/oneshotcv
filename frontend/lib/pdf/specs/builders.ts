/**
 * Spec builders for all 16 templates.
 *
 * Each builder takes a `SpecInput` (CV data + design settings) and returns a
 * `TemplateSpec` that the React-PDF renderer turns into a vector PDF.
 *
 * Builders only choose VISUAL DECISIONS — colors, header variant, section
 * title style, sidebar layout, photo placement. They never branch on whether
 * data exists; the renderer trims empty items.
 */

import {
  TemplateSpec,
  SectionSpec,
  ContactSpec,
  HeaderSpec,
  SidebarSpec,
  BannerSpec,
  ItemSpec,
  SpecBuilder,
  SpecInput,
} from "../types";
import {
  buildTheme,
  DEFAULT_MARGINS,
  COMPACT_MARGINS,
  BASE_FONT_SIZES,
  TEXT_COLORS,
} from "../theme";

const DEFAULT_FOOTER = { text: "Built by oneshotcv.art with love" };

// =============================================================================
// Shared helpers
// =============================================================================

function buildContacts(input: SpecInput): ContactSpec[] {
  const out: ContactSpec[] = [];
  if (input.email) out.push({ icon: "mail", value: input.email });
  if (input.phone) out.push({ icon: "phone", value: input.phone });
  if (input.address) out.push({ icon: "map-pin", value: input.address });
  return out;
}

function buildContactsNoIcons(input: SpecInput): ContactSpec[] {
  const out: ContactSpec[] = [];
  if (input.email) out.push({ value: input.email });
  if (input.phone) out.push({ value: input.phone });
  if (input.address) out.push({ value: input.address });
  return out;
}

function summarySection(input: SpecInput, label = "Summary"): SectionSpec | null {
  if (!input.summary) return null;
  return {
    id: "summary",
    title: { variant: "underline", label },
    items: [{ type: "summary", text: input.summary }],
  };
}

function experienceSection(
  input: SpecInput,
  title: SectionSpec["title"],
): SectionSpec | null {
  if (!input.experience.length) return null;
  return {
    id: "experience",
    title,
    items: input.experience.map(
      (exp): ItemSpec => ({
        type: "experience",
        position: exp.position,
        company: exp.company,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        current: exp.current,
        description: exp.description,
      }),
    ),
  };
}

function educationSection(
  input: SpecInput,
  title: SectionSpec["title"],
  degreeFirst = false,
): SectionSpec | null {
  if (!input.education.length) return null;
  return {
    id: "education",
    title,
    items: input.education.map(
      (edu): ItemSpec => ({
        type: "education",
        institution: edu.institution,
        degree: edu.degree,
        startDate: edu.startDate,
        endDate: edu.endDate,
        current: edu.current,
        description: edu.description,
        degreeFirst,
      }),
    ),
  };
}

function skillsSection(
  input: SpecInput,
  title: SectionSpec["title"],
  layout: import("../types").SkillsLayout = "pills",
  style?: import("../types").SkillsItemSpec["style"],
): SectionSpec | null {
  if (!input.skills.length) return null;
  return {
    id: "skills",
    title,
    items: [
      {
        type: "skills",
        layout,
        style,
        items: input.skills.map((s) => ({ name: s.name, level: s.level })),
      },
    ],
  };
}

/** Drop nulls while keeping spec section type. */
function compact<T>(arr: (T | null)[]): T[] {
  return arr.filter((x): x is T => x !== null);
}

// =============================================================================
// Template builders
// =============================================================================

const buildClassic: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings, { textAlign: "center" });
  const header: HeaderSpec = {
    variant: "centered",
    fullName: input.fullName,
    title: input.title,
    contacts: buildContacts(input),
    accentColor: theme.accentColor,
  };
  return {
    id: "classic",
    label: "Classic",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header,
    sections: compact([
      summarySection(input, "Professional Summary"),
      experienceSection(input, {
        variant: "underline",
        label: "Work Experience",
      }),
      educationSection(input, {
        variant: "underline",
        label: "Education",
      }),
      skillsSection(input, { variant: "underline", label: "Skills" }, "pills"),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildModern: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings);
  const header: HeaderSpec = {
    variant: "split-with-photo",
    fullName: input.fullName,
    title: input.title,
    contacts: buildContacts(input),
    accentColor: theme.accentColor,
    photo: input.photo
      ? {
          url: input.photo.url,
          shape: "rounded",
          sizePt: 70,
          borderColor: theme.accentColor,
          borderWidthPt: 1.5,
        }
      : undefined,
  };
  return {
    id: "modern",
    label: "Modern",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header,
    sections: compact([
      summarySection(input, "About"),
      experienceSection(input, {
        variant: "ruled",
        label: "Experience",
      }),
      educationSection(input, {
        variant: "ruled",
        label: "Education",
      }),
      skillsSection(input, { variant: "ruled", label: "Skills" }, "rated"),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildModernMinimalist: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings);
  return {
    id: "modern-minimalist",
    label: "Modern Minimalist",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "left-aligned",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContacts(input),
      accentColor: theme.accentColor,
    },
    sections: compact([
      summarySection(input, "Summary"),
      experienceSection(input, { variant: "minimal", label: "Experience" }),
      educationSection(input, { variant: "minimal", label: "Education" }),
      skillsSection(input, { variant: "minimal", label: "Skills" }, "pills"),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildElegant: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings, {
    fontFamily: "serif",
    textAlign: "center",
  });
  return {
    id: "elegant",
    label: "Elegant",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "centered",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContactsNoIcons(input),
      accentColor: theme.accentColor,
    },
    sections: compact([
      summarySection(input, "About") &&
        ({
          ...(summarySection(input, "About") as SectionSpec),
          items: [{ type: "summary", text: input.summary, italic: true }],
        } as SectionSpec),
      experienceSection(input, { variant: "uppercase", label: "Experience" }),
      educationSection(input, { variant: "uppercase", label: "Education" }),
      skillsSection(
        input,
        { variant: "uppercase", label: "Expertise" },
        "inline",
      ),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildExecutive: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings, {
    fontFamily: "serif",
    baseFontSizePt: BASE_FONT_SIZES.executive,
  });
  return {
    id: "executive",
    label: "Executive",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "boxed",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContactsNoIcons(input),
      accentColor: theme.accentColor,
      photo: input.photo
        ? {
            url: input.photo.url,
            shape: "rounded",
            sizePt: 90,
            borderColor: theme.accentColor,
            borderWidthPt: 1.5,
          }
        : undefined,
    },
    sections: compact([
      summarySection(input, "Executive Profile"),
      experienceSection(input, {
        variant: "underline",
        label: "Professional Experience",
        uppercase: true,
      }),
      educationSection(input, {
        variant: "underline",
        label: "Education",
        uppercase: true,
      }),
      skillsSection(
        input,
        { variant: "underline", label: "Core Competencies", uppercase: true },
        "grid",
      ),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildProfessional: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings);
  return {
    id: "professional",
    label: "Professional",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "underlined",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContacts(input),
      accentColor: theme.accentColor,
    },
    sections: compact([
      summarySection(input, "Summary"),
      experienceSection(input, {
        variant: "underline",
        label: "Professional Experience",
      }),
      educationSection(input, { variant: "underline", label: "Education" }),
      skillsSection(input, { variant: "underline", label: "Skills" }, "pills"),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildMinimalist: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings);
  return {
    id: "minimalist",
    label: "Minimalist",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "centered",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContactsNoIcons(input),
      accentColor: theme.accentColor,
    },
    sections: compact([
      summarySection(input, "Professional Summary"),
      experienceSection(input, {
        variant: "underline",
        label: "Work Experience",
      }),
      educationSection(input, { variant: "underline", label: "Education" }),
      skillsSection(input, { variant: "underline", label: "Skills" }, "inline"),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildBold: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings);
  const header: HeaderSpec = {
    variant: "banner",
    fullName: input.fullName,
    title: input.title,
    contacts: buildContacts(input),
    accentColor: theme.accentColor,
    backgroundColor: theme.accentColor,
    textColor: "#ffffff",
  };
  return {
    id: "bold",
    label: "Bold",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header,
    sections: compact([
      summarySection(input, "About"),
      skillsSection(input, { variant: "filled-bar", label: "Skills" }, "pills", "outlined"),
      experienceSection(input, {
        variant: "filled-bar",
        label: "Experience",
      }),
      educationSection(input, {
        variant: "filled-bar",
        label: "Education",
      }),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildCreative: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings, { textAlign: "center" });
  return {
    id: "creative",
    label: "Creative",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "banner",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContacts(input),
      accentColor: theme.accentColor,
      backgroundColor: "#1f2937",
      textColor: "#ffffff",
      photo: input.photo
        ? {
            url: input.photo.url,
            shape: "circle",
            sizePt: 90,
            borderColor: theme.accentColor,
            borderWidthPt: 2,
          }
        : undefined,
    },
    sections: compact([
      summarySection(input, "Profile"),
      experienceSection(input, { variant: "uppercase", label: "Experience" }),
      educationSection(input, { variant: "uppercase", label: "Education" }),
      skillsSection(input, { variant: "uppercase", label: "Skills" }, "pills"),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildSidebar: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings);
  const sidebar: SidebarSpec = {
    widthFraction: 0.32,
    background: theme.accentColor,
    textColor: "#ffffff",
    photoLocation: "sidebar",
    contactsLocation: "sidebar",
    skillsInSidebar: true,
  };
  return {
    id: "sidebar",
    label: "Sidebar",
    layout: "sidebar-left",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "left-aligned",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContacts(input),
      accentColor: theme.accentColor,
      photo: input.photo
        ? { url: input.photo.url, shape: "circle", sizePt: 110 }
        : undefined,
    },
    sidebar,
    sections: compact([
      summarySection(input, "Profile"),
      experienceSection(input, { variant: "underline", label: "Experience" }),
      educationSection(input, { variant: "underline", label: "Education" }),
      // Skills appear in sidebar; we still keep the section in the spec because
      // the sidebar reads from `sections` to find skills.
      skillsSection(input, { variant: "uppercase", label: "Skills" }, "list"),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildDesigner: SpecBuilder = (input) => {
  const accent =
    (input.designSettings.themeColor === "#DB4B2E"
      ? "#E0B656"
      : input.designSettings.themeColor) ?? "#E0B656";
  const theme = buildTheme(input.designSettings, { accentColor: accent });
  const sidebar: SidebarSpec = {
    widthFraction: 0.32,
    background: "#F9F5F0",
    textColor: TEXT_COLORS.primary,
    photoLocation: "sidebar",
    contactsLocation: "sidebar",
    skillsInSidebar: true,
  };
  const banner: BannerSpec = {
    heightPt: 90,
    background: accent,
    textColor: "#ffffff",
    align: "right",
    repeatOnEveryPage: true,
  };
  return {
    id: "designer",
    label: "Designer",
    layout: "sidebar-left",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "centered",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContacts(input),
      accentColor: accent,
      photo: input.photo
        ? { url: input.photo.url, shape: "circle", sizePt: 130 }
        : undefined,
    },
    sidebar,
    banner,
    sections: compact([
      summarySection(input, "Professional Profile"),
      experienceSection(input, { variant: "uppercase", label: "Experience" }),
      educationSection(input, { variant: "uppercase", label: "Education" }, true),
      skillsSection(input, { variant: "uppercase", label: "Skills" }, "list"),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildTech: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings);
  return {
    id: "tech",
    label: "Tech",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "split-with-photo",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContacts(input),
      accentColor: theme.accentColor,
      photo: input.photo
        ? {
            url: input.photo.url,
            shape: "rounded",
            sizePt: 64,
            borderColor: theme.accentColor,
            borderWidthPt: 1.5,
          }
        : undefined,
    },
    sections: compact([
      summarySection(input, "About"),
      experienceSection(input, {
        variant: "icon-prefixed",
        label: "Experience",
        icon: "briefcase",
      }),
      educationSection(input, {
        variant: "icon-prefixed",
        label: "Education",
        icon: "graduation-cap",
      }),
      skillsSection(
        input,
        { variant: "icon-prefixed", label: "Skills", icon: "code" },
        "pills",
        "outlined",
      ),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildAcademic: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings, {
    fontFamily: "serif",
    baseFontSizePt: BASE_FONT_SIZES.academic,
    textAlign: "justify",
  });
  return {
    id: "academic",
    label: "Academic",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "centered",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContacts(input),
      accentColor: theme.accentColor,
    },
    sections: compact([
      input.summary
        ? {
            id: "summary",
            title: { variant: "underline", label: "Research Interests" },
            items: [
              { type: "summary", text: input.summary, justify: true },
            ] as ItemSpec[],
          }
        : null,
      educationSection(
        input,
        { variant: "underline", label: "Education", uppercase: true },
        true,
      ),
      experienceSection(input, {
        variant: "underline",
        label: "Professional Experience",
        uppercase: true,
      }),
      skillsSection(
        input,
        { variant: "underline", label: "Technical Skills", uppercase: true },
        "pills",
      ),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildCorporate: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings);
  return {
    id: "corporate",
    label: "Corporate",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "underlined",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContacts(input),
      accentColor: theme.accentColor,
      photo: input.photo
        ? {
            url: input.photo.url,
            shape: "rounded",
            sizePt: 80,
            borderColor: theme.accentColor,
            borderWidthPt: 1.5,
          }
        : undefined,
    },
    sections: compact([
      summarySection(input, "Executive Summary"),
      experienceSection(input, {
        variant: "icon-prefixed",
        label: "Professional Experience",
        icon: "briefcase",
      }),
      educationSection(input, {
        variant: "icon-prefixed",
        label: "Education",
        icon: "graduation-cap",
      }),
      skillsSection(
        input,
        { variant: "icon-prefixed", label: "Core Competencies", icon: "award" },
        "grid",
      ),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildStartup: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings);
  return {
    id: "startup",
    label: "Startup",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "split-with-photo",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContacts(input),
      accentColor: theme.accentColor,
      photo: input.photo
        ? {
            url: input.photo.url,
            shape: "rounded",
            sizePt: 80,
            borderColor: theme.accentColor,
            borderWidthPt: 2,
          }
        : undefined,
    },
    sections: compact([
      summarySection(input, "About"),
      experienceSection(input, {
        variant: "icon-prefixed",
        label: "Experience",
        icon: "rocket",
      }),
      educationSection(input, { variant: "minimal", label: "Education" }),
      skillsSection(input, { variant: "minimal", label: "Skills" }, "pills", "filled"),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

const buildCompact: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings, {
    baseFontSizePt: BASE_FONT_SIZES.compact,
    sectionGapPt: 8,
    itemGapPt: 5,
  });
  return {
    id: "compact",
    label: "Compact",
    layout: "single-column",
    theme,
    margins: COMPACT_MARGINS,
    header: {
      variant: "split-with-photo",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContacts(input),
      accentColor: theme.accentColor,
      photo: input.photo
        ? {
            url: input.photo.url,
            shape: "rounded",
            sizePt: 56,
            borderColor: theme.accentColor,
            borderWidthPt: 1,
          }
        : undefined,
    },
    sections: compact([
      summarySection(input, "Summary"),
      experienceSection(input, { variant: "minimal", label: "Experience" }),
      educationSection(input, { variant: "minimal", label: "Education" }),
      skillsSection(input, { variant: "minimal", label: "Skills" }, "inline"),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

// =============================================================================
// Phase 2 — new unified templates
// =============================================================================

/**
 * ATS Pure — strict, parser-friendly. Theme color is intentionally forced to
 * black: the whole point of this template is bullet-proof ATS compatibility,
 * which the user's accent color choice would compromise.
 */
const buildAtsPure: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings, {
    accentColor: "#000000",
    fontFamily: "sans",
    textColor: "#000000",
    mutedColor: "#1f2937",
    baseFontSizePt: 11,
  });
  return {
    id: "ats-pure",
    label: "ATS Pure",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "left-aligned",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContactsNoIcons(input),
      accentColor: "#000000",
    },
    sections: compact([
      summarySection(input, "Summary"),
      experienceSection(input, {
        variant: "underline",
        label: "Professional Experience",
        uppercase: true,
        color: "#000000",
      }),
      educationSection(input, {
        variant: "underline",
        label: "Education",
        uppercase: true,
        color: "#000000",
      }),
      skillsSection(
        input,
        {
          variant: "underline",
          label: "Skills",
          uppercase: true,
          color: "#000000",
        },
        "inline",
      ),
    ]),
  };
};

/**
 * ATS Chronological — single accent line, explicit reverse-chronological flow.
 * Slightly more visual than ATS Pure but still parser-safe.
 */
const buildAtsChronological: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings);
  return {
    id: "ats-chronological",
    label: "ATS Chronological",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "left-aligned",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContactsNoIcons(input),
      accentColor: theme.accentColor,
    },
    sections: compact([
      summarySection(input, "Summary"),
      experienceSection(input, {
        variant: "underline",
        label: "Experience",
        uppercase: true,
      }),
      educationSection(input, {
        variant: "underline",
        label: "Education",
        uppercase: true,
      }),
      skillsSection(
        input,
        { variant: "underline", label: "Skills", uppercase: true },
        "inline",
      ),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

/**
 * Engineer — skills FIRST, dense tech-stack grid, code-style monospace dates.
 */
const buildEngineer: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings);
  return {
    id: "engineer",
    label: "Engineer",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "underlined",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContacts(input),
      accentColor: theme.accentColor,
      photo: input.photo
        ? {
            url: input.photo.url,
            shape: "rounded",
            sizePt: 64,
            borderColor: theme.accentColor,
            borderWidthPt: 1.5,
          }
        : undefined,
    },
    sections: compact([
      summarySection(input, "About"),
      // Skills before experience — engineers get screened on stack first
      skillsSection(
        input,
        { variant: "uppercase", label: "Tech Stack" },
        "grid",
        "outlined",
      ),
      experienceSection(input, {
        variant: "uppercase",
        label: "Experience",
      }),
      educationSection(input, {
        variant: "uppercase",
        label: "Education",
      }),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

/**
 * Timeline — consultant-style. The HTML preview draws a literal vertical
 * timeline; React-PDF doesn't support absolute-positioned dots reliably across
 * page breaks, so we emulate the look with a left border on each item.
 */
const buildTimeline: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings);
  return {
    id: "timeline",
    label: "Timeline",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "left-aligned",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContacts(input),
      accentColor: theme.accentColor,
    },
    sections: compact([
      summarySection(input, "About"),
      experienceSection(input, {
        variant: "uppercase",
        label: "Experience",
      }),
      educationSection(input, {
        variant: "uppercase",
        label: "Education",
      }),
      skillsSection(
        input,
        { variant: "uppercase", label: "Skills" },
        "pills",
        "soft",
      ),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

/**
 * Photo First — large circular photo hero, centered everywhere.
 */
const buildPhotoFirst: SpecBuilder = (input) => {
  const theme = buildTheme(input.designSettings, { textAlign: "center" });
  return {
    id: "photo-first",
    label: "Photo First",
    layout: "single-column",
    theme,
    margins: DEFAULT_MARGINS,
    header: {
      variant: "centered",
      fullName: input.fullName,
      title: input.title,
      contacts: buildContacts(input),
      accentColor: theme.accentColor,
      photo: input.photo
        ? {
            url: input.photo.url,
            shape: "circle",
            sizePt: 130,
            borderColor: theme.accentColor,
            borderWidthPt: 3,
          }
        : undefined,
    },
    sections: compact([
      summarySection(input, "Profile"),
      experienceSection(input, {
        variant: "underline",
        label: "Experience",
      }),
      educationSection(input, {
        variant: "underline",
        label: "Education",
      }),
      skillsSection(
        input,
        { variant: "underline", label: "Skills" },
        "pills",
        "outlined",
      ),
    ]),
    footer: DEFAULT_FOOTER,
  };
};

// =============================================================================
// Registry
// =============================================================================

const BUILDERS: Record<string, SpecBuilder> = {
  classic: buildClassic,
  modern: buildModern,
  "modern-minimalist": buildModernMinimalist,
  elegant: buildElegant,
  executive: buildExecutive,
  professional: buildProfessional,
  minimalist: buildMinimalist,
  bold: buildBold,
  creative: buildCreative,
  sidebar: buildSidebar,
  designer: buildDesigner,
  tech: buildTech,
  academic: buildAcademic,
  corporate: buildCorporate,
  startup: buildStartup,
  compact: buildCompact,
  // Phase 2 unified templates
  "ats-pure": buildAtsPure,
  "ats-chronological": buildAtsChronological,
  engineer: buildEngineer,
  timeline: buildTimeline,
  "photo-first": buildPhotoFirst,
};

/**
 * Build a TemplateSpec for the given template id. Falls back to "classic" if
 * the template id is unknown.
 */
export function buildSpecForTemplate(
  templateId: string | undefined,
  input: SpecInput,
): TemplateSpec {
  const builder = BUILDERS[templateId ?? "classic"] ?? BUILDERS.classic;
  return builder(input);
}

/** Exposed for testing / future inspection. */
export { BUILDERS };
