// Templates shown in the dashboard gallery. Order mirrors the create-modal
// `templateOptions` list. Each `id` maps to a component in
// `components/templates/` and to a faithful miniature in `TemplateThumbnail`.

export type TemplateTagTone = "ats" | "brand" | "neutral";

export interface TemplateGalleryItem {
  id: string;
  name: string;
  tag: string;
  tone: TemplateTagTone;
}

export const TEMPLATE_GALLERY: TemplateGalleryItem[] = [
  { id: "ats-pure", name: "ATS Pure", tag: "ATS friendly", tone: "ats" },
  { id: "ats-chronological", name: "ATS Chronological", tag: "ATS friendly", tone: "ats" },
  { id: "engineer", name: "Engineer", tag: "Tech stack first", tone: "brand" },
  { id: "timeline", name: "Timeline", tag: "Consultant", tone: "brand" },
  { id: "photo-first", name: "Photo First", tag: "Personal brand", tone: "brand" },
  { id: "classic", name: "Classic", tag: "Timeless", tone: "neutral" },
  { id: "modern", name: "Modern", tag: "Modern", tone: "brand" },
  { id: "modern-minimalist", name: "Modern Minimalist", tag: "Clean", tone: "brand" },
  { id: "elegant", name: "Elegant", tag: "Refined", tone: "neutral" },
  { id: "executive", name: "Executive", tag: "Leadership", tone: "neutral" },
  { id: "creative", name: "Creative", tag: "Expressive", tone: "brand" },
  { id: "minimalist", name: "Minimalist", tag: "Minimal", tone: "neutral" },
  { id: "professional", name: "Professional", tag: "Professional", tone: "neutral" },
  { id: "bold", name: "Bold", tag: "High impact", tone: "brand" },
  { id: "sidebar", name: "Sidebar", tag: "Two-column", tone: "brand" },
  { id: "designer", name: "Designer", tag: "Portfolio", tone: "brand" },
  { id: "tech", name: "Tech", tag: "Developer", tone: "brand" },
  { id: "academic", name: "Academic", tag: "Research", tone: "neutral" },
  { id: "corporate", name: "Corporate", tag: "Corporate", tone: "neutral" },
  { id: "startup", name: "Startup", tag: "Dynamic", tone: "brand" },
  { id: "compact", name: "Compact", tag: "Space-saving", tone: "neutral" },
];
