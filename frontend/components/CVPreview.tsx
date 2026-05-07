import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
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
import { TemplateBlock } from "./templates/types";
import { templateColors } from "./templates/colors";

// Constants for A4 layout
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PADDING_MM = 20;
const PX_PER_MM = 3.78;
const CONTENT_WIDTH_PX = (A4_WIDTH_MM - 2 * PADDING_MM) * PX_PER_MM;
const CONTENT_HEIGHT_PX = (A4_HEIGHT_MM - 2 * PADDING_MM) * PX_PER_MM;

const DEFAULT_FONT_SIZES = { header: 2.25, sectionTitle: 1.5, body: 1 };
const DEFAULT_SPACING = { lineHeight: 1.6, sectionPadding: 2, itemGap: 1 };

const colors = {
  textMain: templateColors.textMain,
  textSec: templateColors.textSec,
  textMuted: templateColors.textMuted,
  bgPage: templateColors.bgWhite,
};

interface PageBlock {
  id: string;
  height: number;
  content: React.ReactNode;
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
  const [pages, setPages] = useState<
    { id: string; content: React.ReactNode }[][]
  >([]);
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

  // Memoize template data to prevent unnecessary recalculations
  const templateData = useMemo(
    () => ({
      personalInfo,
      education,
      experience,
      skills,
      designSettings,
    }),
    [personalInfo, education, experience, skills, designSettings]
  );

  // Memoize blocks generation - only recalculate when data changes
  const getBlocks = useCallback((): TemplateBlock[] => {
    switch (selectedTemplate) {
      case "creative":
        return getCreativeTemplateBlocks(templateData, designSettings);
      case "minimalist":
        return getMinimalistTemplateBlocks(templateData, designSettings);
      case "professional":
        return getProfessionalTemplateBlocks(templateData, designSettings);
      case "executive":
        return getExecutiveTemplateBlocks(templateData, designSettings);
      case "elegant":
        return getElegantTemplateBlocks(templateData, designSettings);
      case "modern-minimalist":
        return getModernMinimalistTemplateBlocks(templateData, designSettings);
      case "modern":
        return getModernTemplateBlocks(templateData, designSettings);
      case "bold":
        return getBoldTemplateBlocks(templateData, designSettings);
      case "sidebar":
        return getSidebarTemplateBlocks(templateData, designSettings);
      case "designer":
        return getDesignerTemplateBlocks(templateData, designSettings);
      case "tech":
        return getTechTemplateBlocks(templateData, designSettings);
      case "academic":
        return getAcademicTemplateBlocks(templateData, designSettings);
      case "corporate":
        return getCorporateTemplateBlocks(templateData, designSettings);
      case "startup":
        return getStartupTemplateBlocks(templateData, designSettings);
      case "compact":
        return getCompactTemplateBlocks(templateData, designSettings);
      case "classic":
      default:
        return getClassicTemplateBlocks(templateData, designSettings);
    }
  }, [selectedTemplate, templateData, designSettings]);

  // Memoize data key for effect dependencies
  const dataKey = useMemo(
    () =>
      JSON.stringify({
        personalInfo,
        education,
        experience,
        skills,
        selectedTemplate,
        designSettings,
        dataVersion,
      }),
    [
      personalInfo,
      education,
      experience,
      skills,
      selectedTemplate,
      designSettings,
      dataVersion,
    ]
  );

  useEffect(() => {
    if (!measureRef.current || isLoading) return;

    // Use double RAF for smoother updates
    let frame2: number | undefined;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        const container = measureRef.current;
        if (!container) return;

        const children = Array.from(container.children) as HTMLElement[];
        const blocks = getBlocks();

        const measuredBlocks: PageBlock[] = children.map((child, index) => ({
          id: blocks[index]?.id || `unknown-${index}`,
          height: child.offsetHeight,
          content: blocks[index]?.content,
        }));

        const newPages: { id: string; content: React.ReactNode }[][] = [];
        let currentPage: { id: string; content: React.ReactNode }[] = [];
        let currentHeight = 0;

        measuredBlocks.forEach((block) => {
          if (currentHeight + block.height > CONTENT_HEIGHT_PX) {
            if (currentPage.length > 0) {
              newPages.push(currentPage);
              currentPage = [];
              currentHeight = 0;
            }
          }
          currentPage.push({ id: block.id, content: block.content });
          currentHeight += block.height;
        });

        if (currentPage.length > 0) {
          newPages.push(currentPage);
        }

        setPages(newPages);
      });
    });

    return () => {
      if (frame1) cancelAnimationFrame(frame1);
      if (frame2) cancelAnimationFrame(frame2);
    };
  }, [dataKey, isLoading, getBlocks]);

  const renderMeasurementBlocks = () => {
    const blocks = getBlocks();
    return blocks.map((block) => (
      <div
        key={block.id}
        data-id={block.id}
        className="cv-block"
        style={{ paddingBottom: resolvedSpacing.sectionPadding + "rem" }}
      >
        {block.content}
      </div>
    ));
  };

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
              width: `${CONTENT_WIDTH_PX}px`,
              visibility: "hidden",
              position: "absolute",
              zIndex: -1000,
              backgroundColor: "#fff",
              ...designVars,
            }}
            className="cv-page"
          >
            {renderMeasurementBlocks()}
          </div>

          {/* Render Pages */}
          {pages.map((pageContent, index) => (
            <div
              key={`${dataVersion}-${index}`}
              className="cv-page bg-white shadow-lg box-border mx-auto relative opacity-0 animate-fade-in"
              style={{
                width: "210mm",
                height: "297mm",
                padding: "20mm",
                backgroundColor: "#ffffff",
                color: colors.textMain,
                overflow: "hidden",
                marginBottom: "20px",
                animation: "fadeIn 0.3s ease-in-out forwards",
                animationDelay: `${index * 0.1}s`,
                ...designVars,
              }}
            >
              {pageContent.map((block) => (
                <div
                  key={block.id}
                  className="cv-block"
                  style={{
                    paddingBottom: resolvedSpacing.sectionPadding + "rem",
                  }}
                >
                  {block.content}
                </div>
              ))}

              <div
                style={{
                  position: "absolute",
                  bottom: "10mm",
                  right: "20mm",
                  fontSize: "0.75rem",
                  color: colors.textMuted,
                }}
              >
                Page {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
CVPreview.displayName = 'CVPreview';
