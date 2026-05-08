import React, { useRef, useState, useEffect, useMemo } from "react";
import { useCVStore } from "@/store/useCVStore";
import { PreviewSkeleton } from "./ui/EditorSkeleton";
import { getClassicTemplateBlocks } from "./templates/ClassicTemplate";
import { getCreativeTemplateBlocks } from "./templates/CreativeTemplate";
import { getMinimalistTemplateBlocks } from "./templates/MinimalistTemplate";
import { getProfessionalTemplateBlocks } from "./templates/ProfessionalTemplate";
import { getExecutiveTemplateBlocks } from "./templates/ExecutiveTemplate";
import { getElegantTemplateBlocks } from "./templates/ElegantTemplate";
import { getModernMinimalistTemplateBlocks } from "./templates/ModernMinimalistTemplate";
import { getBoldTemplateBlocks } from "./templates/BoldTemplate";
import { getSidebarTemplateBlocks } from "./templates/SidebarTemplate";
import { getDesignerTemplateBlocks } from "./templates/DesignerTemplate";
import { getModernTemplateBlocks } from "./templates/ModernTemplate";
import { getTechTemplateBlocks } from "./templates/TechTemplate";
import { getAcademicTemplateBlocks } from "./templates/AcademicTemplate";
import { getCorporateTemplateBlocks } from "./templates/CorporateTemplate";
import { getStartupTemplateBlocks } from "./templates/StartupTemplate";
import { getCompactTemplateBlocks } from "./templates/CompactTemplate";
import { getAtsPureTemplateBlocks } from "./templates/AtsPureTemplate";
import { getAtsChronoTemplateBlocks } from "./templates/AtsChronoTemplate";
import { getEngineerTemplateBlocks } from "./templates/EngineerTemplate";
import { getTimelineTemplateBlocks } from "./templates/TimelineTemplate";
import { getPhotoFirstTemplateBlocks } from "./templates/PhotoFirstTemplate";
import {
  TemplateBlock,
  TemplateGenerator,
  TemplateLayout,
  TemplateOutput,
} from "./templates/types";
import { templateColors } from "./templates/colors";

// === A4 page geometry ===
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PADDING_MM = 20;
const PX_PER_MM = 3.78;
const CONTENT_WIDTH_PX = (A4_WIDTH_MM - 2 * PADDING_MM) * PX_PER_MM;
// We deliberately keep a small safety margin at the bottom of each page so
// that text never collides with the (off-page) page-number indicator and so
// that the rasterized PDF capture has clean breathing room.
const PAGE_BOTTOM_SAFETY_PX = 12;
const CONTENT_HEIGHT_PX =
  (A4_HEIGHT_MM - 2 * PADDING_MM) * PX_PER_MM - PAGE_BOTTOM_SAFETY_PX;

const DEFAULT_FONT_SIZES = { header: 2.25, sectionTitle: 1.5, body: 1 };
const DEFAULT_SPACING = { lineHeight: 1.6, sectionPadding: 2, itemGap: 1 };

const colors = {
  textMain: templateColors.textMain,
  textSec: templateColors.textSec,
  textMuted: templateColors.textMuted,
  bgPage: templateColors.bgWhite,
};

interface MeasuredBlock extends TemplateBlock {
  height: number;
}

interface ResolvedTemplateOutput {
  blocks: TemplateBlock[];
  layout: TemplateLayout;
}

const SINGLE_COLUMN_LAYOUT: TemplateLayout = { kind: "single-column" };

/**
 * Normalize a template generator output: legacy `TemplateBlock[]` returns are
 * promoted to `{ blocks, layout: single-column }`.
 */
function normalizeTemplateOutput(
  output: TemplateBlock[] | TemplateOutput,
): ResolvedTemplateOutput {
  if (Array.isArray(output)) {
    return { blocks: output, layout: SINGLE_COLUMN_LAYOUT };
  }
  return {
    blocks: output.blocks,
    layout: output.layout ?? SINGLE_COLUMN_LAYOUT,
  };
}

/**
 * Page-break aware paginator.
 *
 * Rules in priority order:
 *  1. A `footer` block is always pushed onto the LAST page (and never repeated).
 *  2. A block tagged `section-title` is "glued" to the next block — if we
 *     can't fit (title + first following block) on the current page, we
 *     start a new page rather than orphaning the title at the bottom.
 *  3. A block tagged `atomic` will start a new page if it doesn't fit,
 *     even if there is leftover space on the current page.
 *  4. Otherwise blocks flow until the page is full.
 *
 * Heights are measured by the caller against the same content width and
 * design tokens that the final pages use, so the values are accurate.
 */
function paginateBlocks(
  measured: MeasuredBlock[],
  maxHeight: number,
): TemplateBlock[][] {
  const pages: TemplateBlock[][] = [];
  let currentPage: TemplateBlock[] = [];
  let currentHeight = 0;

  // Pull the footer out — always goes on the last page.
  const footerIndex = measured.findIndex((b) => b.kind === "footer");
  const footer = footerIndex >= 0 ? measured[footerIndex] : null;
  const flow = footer
    ? [...measured.slice(0, footerIndex), ...measured.slice(footerIndex + 1)]
    : measured;

  const pushBlock = (block: MeasuredBlock) => {
    currentPage.push({ id: block.id, content: block.content, kind: block.kind });
    currentHeight += block.height;
  };

  const startNewPage = () => {
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
    currentPage = [];
    currentHeight = 0;
  };

  for (let i = 0; i < flow.length; i++) {
    const block = flow[i];
    const next = flow[i + 1];

    // Glue: title + first following item must fit together.
    if (block.kind === "section-title" && next) {
      const combinedHeight = block.height + next.height;
      const fitsCombinedOnCurrentPage =
        currentHeight + combinedHeight <= maxHeight;
      const fitsCombinedOnFreshPage = combinedHeight <= maxHeight;

      if (!fitsCombinedOnCurrentPage && fitsCombinedOnFreshPage) {
        startNewPage();
      }
      pushBlock(block);
      continue;
    }

    // Atomic: never split, start new page if needed.
    if (block.kind === "atomic" && currentHeight + block.height > maxHeight) {
      startNewPage();
      pushBlock(block);
      continue;
    }

    // Default flow.
    if (currentHeight + block.height > maxHeight && currentPage.length > 0) {
      startNewPage();
    }
    pushBlock(block);
  }

  if (footer) {
    // Try to put the footer on the current (final) page.
    if (currentHeight + footer.height > maxHeight) {
      startNewPage();
    }
    pushBlock(footer);
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages.length > 0 ? pages : [[]];
}

export const CVPreview: React.FC = React.memo(() => {
  const {
    personalInfo,
    education,
    experience,
    skills,
    selectedTemplate,
    designSettings,
    isLoading,
    dataVersion,
  } = useCVStore();

  const [zoom, setZoom] = useState(0.8);
  const [pages, setPages] = useState<TemplateBlock[][]>([]);
  const measureRef = useRef<HTMLDivElement>(null);

  const resolvedFontSizes = {
    ...DEFAULT_FONT_SIZES,
    ...designSettings.fontSizes,
  };
  const resolvedSpacing = { ...DEFAULT_SPACING, ...designSettings.spacing };
  const fontFamily =
    designSettings.fontFamily === "serif"
      ? "Georgia, serif"
      : designSettings.fontFamily === "mono"
      ? "Courier New, monospace"
      : designSettings.fontFamily === "times"
      ? '"Times New Roman", Times, serif'
      : "ui-sans-serif, system-ui, sans-serif";

  const designVars = {
    fontFamily,
    lineHeight: resolvedSpacing.lineHeight,
    textAlign: designSettings.textAlignment,
    "--cv-header-size": `${resolvedFontSizes.header * designSettings.scale}rem`,
    "--cv-section-size": `${
      resolvedFontSizes.sectionTitle * designSettings.scale
    }rem`,
    "--cv-body-size": `${resolvedFontSizes.body * designSettings.scale}rem`,
    "--cv-line-height": resolvedSpacing.lineHeight,
    "--cv-text-align": designSettings.textAlignment,
    "--cv-font-family": fontFamily,
    "--cv-section-padding": `${resolvedSpacing.sectionPadding}rem`,
    "--cv-item-gap": `${resolvedSpacing.itemGap}rem`,
  } as React.CSSProperties;

  // Pick the right generator for the currently selected template.
  const generator = useMemo<TemplateGenerator>(() => {
    switch (selectedTemplate) {
      case "creative":
        return getCreativeTemplateBlocks;
      case "minimalist":
        return getMinimalistTemplateBlocks;
      case "professional":
        return getProfessionalTemplateBlocks;
      case "executive":
        return getExecutiveTemplateBlocks;
      case "elegant":
        return getElegantTemplateBlocks;
      case "modern-minimalist":
        return getModernMinimalistTemplateBlocks;
      case "modern":
        return getModernTemplateBlocks;
      case "bold":
        return getBoldTemplateBlocks;
      case "sidebar":
        return getSidebarTemplateBlocks;
      case "designer":
        return getDesignerTemplateBlocks;
      case "tech":
        return getTechTemplateBlocks;
      case "academic":
        return getAcademicTemplateBlocks;
      case "corporate":
        return getCorporateTemplateBlocks;
      case "startup":
        return getStartupTemplateBlocks;
      case "compact":
        return getCompactTemplateBlocks;
      case "ats-pure":
        return getAtsPureTemplateBlocks;
      case "ats-chronological":
        return getAtsChronoTemplateBlocks;
      case "engineer":
        return getEngineerTemplateBlocks;
      case "timeline":
        return getTimelineTemplateBlocks;
      case "photo-first":
        return getPhotoFirstTemplateBlocks;
      case "classic":
      default:
        return getClassicTemplateBlocks;
    }
  }, [selectedTemplate]);

  // Memoize the entire normalized template output (blocks + layout).
  const templateOutput = useMemo<ResolvedTemplateOutput>(() => {
    const data = {
      personalInfo,
      education,
      experience,
      skills,
      designSettings,
    };
    return normalizeTemplateOutput(generator(data, designSettings));
  }, [
    generator,
    personalInfo,
    education,
    experience,
    skills,
    designSettings,
  ]);

  const { blocks, layout } = templateOutput;

  // Compute the per-page available height taking the header banner (if any)
  // into account. The banner reserves vertical space at the top of each page.
  const pageMaxHeight = useMemo(() => {
    const bannerOffset =
      layout.banner && layout.banner.repeatOnEveryPage
        ? layout.banner.height
        : 0;
    return CONTENT_HEIGHT_PX - bannerOffset;
  }, [layout]);

  // For sidebar layouts the measurement column must be the same width as the
  // main column on the real page (the sidebar takes a fixed % off the left),
  // because line-wrapping changes the height of every block.
  const measureWidthPx = CONTENT_WIDTH_PX;

  useEffect(() => {
    if (!measureRef.current || isLoading) return;

    let frame2: number | undefined;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        const container = measureRef.current;
        if (!container) return;

        const children = Array.from(container.children) as HTMLElement[];

        const measuredBlocks: MeasuredBlock[] = children.map((child, index) => ({
          id: blocks[index]?.id ?? `unknown-${index}`,
          kind: blocks[index]?.kind,
          content: blocks[index]?.content,
          height: child.offsetHeight,
        }));

        setPages(paginateBlocks(measuredBlocks, pageMaxHeight));
      });
    });

    return () => {
      if (frame1) cancelAnimationFrame(frame1);
      if (frame2) cancelAnimationFrame(frame2);
    };
  }, [blocks, pageMaxHeight, isLoading]);

  const renderMeasurementBlocks = () =>
    blocks.map((block) => (
      <div
        key={block.id}
        data-id={block.id}
        className="cv-block"
        style={{ paddingBottom: resolvedSpacing.sectionPadding + "rem" }}
      >
        {block.content}
      </div>
    ));

  if (isLoading) {
    return <PreviewSkeleton />;
  }

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white p-1.5 rounded-lg shadow-md border border-gray-200 backdrop-blur-sm">
        <button
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors duration-150 active:scale-95"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <span className="text-xs font-medium w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors duration-150 active:scale-95"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <button
          onClick={() => setZoom(0.8)}
          className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors duration-150 active:scale-95"
          aria-label="Reset zoom"
        >
          Reset
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-gray-100 p-8 flex justify-center items-start">
        <div
          className="flex flex-col gap-8 transition-transform origin-top duration-300 ease-out"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Hidden Measurement Container */}
          <div
            ref={measureRef}
            style={{
              width: `${measureWidthPx}px`,
              visibility: "hidden",
              position: "absolute",
              zIndex: -1000,
              backgroundColor: "#fff",
              ...designVars,
              ...layout.pageStyle,
            }}
            className="cv-page"
          >
            {renderMeasurementBlocks()}
          </div>

          {/* Render Pages */}
          {pages.map((pageContent, index) => {
            const showBanner =
              layout.banner &&
              (layout.banner.repeatOnEveryPage || index === 0);
            const bannerOffset = showBanner ? layout.banner!.height : 0;

            return (
              <div
                key={`page-${dataVersion}-${index}`}
                className="cv-page-wrapper relative mx-auto"
                style={{ width: "210mm" }}
              >
                <div
                  // The on-screen A4 page. PDF export is now handled by
                  // React-PDF (lib/pdf/) which builds the document from the
                  // CV state directly — this DOM tree is purely for preview.
                  data-pdf-page
                  className="cv-page bg-white shadow-lg box-border opacity-0 animate-fade-in"
                  style={{
                    width: "210mm",
                    height: "297mm",
                    padding: "20mm",
                    backgroundColor: "#ffffff",
                    color: colors.textMain,
                    overflow: "hidden",
                    position: "relative",
                    animation: "fadeIn 0.3s ease-in-out forwards",
                    animationDelay: `${index * 0.1}s`,
                    ...designVars,
                    ...layout.pageStyle,
                  }}
                >
                  {/* Sidebar (rendered every page) */}
                  {layout.sidebar && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: layout.sidebar.width,
                        backgroundColor: layout.sidebar.background,
                        color: layout.sidebar.color,
                      }}
                    >
                      {layout.sidebar.content}
                    </div>
                  )}

                  {/* Banner (rendered first or every page depending on layout) */}
                  {showBanner && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: layout.sidebar?.width ?? 0,
                        right: 0,
                        height: layout.banner!.height,
                      }}
                    >
                      {layout.banner!.content}
                    </div>
                  )}

                  {/* Flow content area, offset for banner if present */}
                  <div
                    style={{
                      position: "relative",
                      paddingTop: bannerOffset,
                      // Reserve a small safety margin at the bottom so text
                      // doesn't kiss the page edge.
                      paddingBottom: PAGE_BOTTOM_SAFETY_PX,
                      minHeight: "100%",
                    }}
                  >
                    {pageContent.map((block) => (
                      <div
                        key={block.id}
                        className="cv-block"
                        style={{
                          paddingBottom:
                            resolvedSpacing.sectionPadding + "rem",
                        }}
                      >
                        {block.content}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Page indicator — OUTSIDE .cv-page so it isn't captured into
                    the PDF. Visible only in the on-screen preview. */}
                <div
                  data-pdf-exclude
                  className="text-xs text-gray-400 text-right mt-2 pr-1 select-none"
                >
                  Page {index + 1} of {pages.length}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
CVPreview.displayName = "CVPreview";
