import React from "react";
import { CVState, CVDesignSettings } from "@/types/cv";
import { TemplateBlock, TemplateGenerator, TemplateOutput } from "./types";
import { Mail, Phone, MapPin } from "lucide-react";

/**
 * Sidebar template
 *
 * Layout: dark colored sidebar on the left (30% width) with photo, contacts
 * and skills; main content (summary, experience, education) on the right.
 *
 * The sidebar is rendered by `CVPreview` on every page automatically via the
 * `layout.sidebar` descriptor, so multi-page CVs no longer lose the sidebar
 * on page 2+.
 */

const SIDEBAR_WIDTH = "30%";
// Slight extra space between sidebar and main content
const MAIN_LEFT_OFFSET = "34%";

export const getSidebarTemplateBlocks: TemplateGenerator = (
  data: CVState,
  settings: CVDesignSettings,
): TemplateOutput => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;

  const baseStyle: React.CSSProperties = {
    fontFamily:
      fontFamily === "serif"
        ? "Georgia, serif"
        : fontFamily === "mono"
        ? "Courier New, monospace"
        : "ui-sans-serif, system-ui, sans-serif",
    fontSize: `${0.9 * scale}rem`,
    lineHeight: 1.6,
    color: "#334155",
  };

  // Style applied to every main-column block to clear the sidebar.
  const mainColumnStyle: React.CSSProperties = {
    marginLeft: MAIN_LEFT_OFFSET,
    ...baseStyle,
  };

  // === Sidebar content (rendered on every page by CVPreview) ===
  const sidebarContent = (
    <div
      style={{
        ...baseStyle,
        color: "white",
        padding: "2rem",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {personalInfo.photo && (
        <div className="mb-6 flex justify-center">
          <img
            src={personalInfo.photo.url}
            alt={personalInfo.fullName}
            className="w-40 h-40 rounded-full object-cover border-4 border-white/20"
            style={{ aspectRatio: "1 / 1" }}
          />
        </div>
      )}

      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2 leading-tight"
          style={{ color: "white" }}
        >
          {personalInfo.fullName}
        </h1>
        <p
          className="text-lg font-medium"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          {personalInfo.title}
        </p>
      </div>

      <div className="mb-8 space-y-3 text-sm">
        {personalInfo.email && (
          <div className="flex items-center gap-2">
            <Mail size={14} className="shrink-0 opacity-80" />
            <span className="break-all">{personalInfo.email}</span>
          </div>
        )}
        {personalInfo.phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="shrink-0 opacity-80" />
            <span>{personalInfo.phone}</span>
          </div>
        )}
        {personalInfo.address && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0 opacity-80" />
            <span>{personalInfo.address}</span>
          </div>
        )}
      </div>

      {skills.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 border-b border-white/30 pb-1 uppercase tracking-wider">
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-2 py-1 bg-white/20 rounded text-sm"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const blocks: TemplateBlock[] = [];

  if (personalInfo.summary) {
    blocks.push({
      id: "summary",
      kind: "section-item",
      content: (
        <div style={mainColumnStyle} className="mb-6">
          <h3
            className="text-xl font-bold mb-3 text-gray-800 border-b-2 pb-1"
            style={{ borderColor: themeColor }}
          >
            Profile
          </h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {personalInfo.summary}
          </p>
        </div>
      ),
    });
  }

  if (experience.length > 0) {
    blocks.push({
      id: "experience-title",
      kind: "section-title",
      content: (
        <div style={mainColumnStyle} className="mb-4">
          <h3
            className="text-xl font-bold text-gray-800 border-b-2 pb-1"
            style={{ borderColor: themeColor }}
          >
            Experience
          </h3>
        </div>
      ),
    });

    experience.forEach((exp) => {
      blocks.push({
        id: `exp-${exp.id}`,
        kind: "section-item",
        content: (
          <div style={mainColumnStyle} className="mb-6">
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-bold text-lg text-gray-900">
                {exp.position}
              </h4>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
              </span>
            </div>
            <div
              className="text-md font-semibold mb-2"
              style={{ color: themeColor }}
            >
              {exp.company}
              {exp.location && (
                <span className="text-gray-500 font-normal text-sm">
                  {" "}
                  · {exp.location}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm whitespace-pre-line">
              {exp.description}
            </p>
          </div>
        ),
      });
    });
  }

  if (education.length > 0) {
    blocks.push({
      id: "education-title",
      kind: "section-title",
      content: (
        <div style={mainColumnStyle} className="mb-4">
          <h3
            className="text-xl font-bold text-gray-800 border-b-2 pb-1"
            style={{ borderColor: themeColor }}
          >
            Education
          </h3>
        </div>
      ),
    });

    education.forEach((edu) => {
      blocks.push({
        id: `edu-${edu.id}`,
        kind: "section-item",
        content: (
          <div style={mainColumnStyle} className="mb-6">
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-bold text-lg text-gray-900">
                {edu.institution}
              </h4>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {edu.startDate} -{" "}
                {edu.current ? "Present" : edu.endDate || "Present"}
              </span>
            </div>
            <div
              className="text-md font-semibold"
              style={{ color: themeColor }}
            >
              {edu.degree}
            </div>
            {edu.description && (
              <p className="text-gray-600 text-sm mt-1 whitespace-pre-line">
                {edu.description}
              </p>
            )}
          </div>
        ),
      });
    });
  }

  blocks.push({
    id: "footer",
    kind: "footer",
    content: (
      <div
        style={{
          ...mainColumnStyle,
          marginTop: "2rem",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "#9ca3af",
        }}
      >
        Built by{" "}
        <span style={{ fontWeight: "bold", color: themeColor }}>
          oneshotcv.art
        </span>{" "}
        with love
      </div>
    ),
  });

  return {
    blocks,
    layout: {
      kind: "sidebar-left",
      sidebar: {
        width: SIDEBAR_WIDTH,
        background: themeColor,
        color: "white",
        content: sidebarContent,
      },
    },
  };
};
