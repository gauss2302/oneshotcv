import React from "react";
import { CVState, CVDesignSettings } from "@/types/cv";
import { TemplateBlock, TemplateGenerator, TemplateOutput } from "./types";
import { Mail, Phone, MapPin } from "lucide-react";

/**
 * Designer template
 *
 * Layout: warm beige sidebar on the left (35% width) with photo, contacts and
 * skills; gold/themed banner across the top-right of every page carrying the
 * candidate's name and title; main content (profile, experience, education)
 * fills the right column.
 *
 * Both the sidebar and banner are rendered by `CVPreview` on every page via
 * the `layout` descriptor, so multi-page CVs preserve the visual identity.
 */

const SIDEBAR_WIDTH = "35%";
const MAIN_LEFT_OFFSET = "38%";
const BANNER_HEIGHT_PX = 180;

const PALETTE = {
  sidebarBg: "#F9F5F0",
  textMain: "#333333",
  textMuted: "#666666",
  white: "#FFFFFF",
};

export const getDesignerTemplateBlocks: TemplateGenerator = (
  data: CVState,
  settings: CVDesignSettings,
): TemplateOutput => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;

  // Default to gold when the user hasn't picked a custom theme; otherwise
  // honour their colour selection.
  const accentColor = themeColor === "#3b82f6" ? "#E0B656" : themeColor;

  const baseStyle: React.CSSProperties = {
    fontFamily:
      fontFamily === "serif"
        ? "Georgia, serif"
        : fontFamily === "mono"
        ? "Courier New, monospace"
        : "ui-sans-serif, system-ui, sans-serif",
    fontSize: `${0.9 * scale}rem`,
    lineHeight: 1.6,
    color: PALETTE.textMain,
  };

  const mainColumnStyle: React.CSSProperties = {
    marginLeft: MAIN_LEFT_OFFSET,
    ...baseStyle,
  };

  // === Sidebar (rendered every page) ===
  const sidebarContent = (
    <div
      style={{
        ...baseStyle,
        padding: "2rem",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {personalInfo.photo && (
        <div className="mb-8 flex justify-center">
          <img
            src={personalInfo.photo.url}
            alt={personalInfo.fullName}
            className="w-56 h-56 rounded-full object-cover border-4 border-white shadow-sm"
            style={{ aspectRatio: "1 / 1" }}
          />
        </div>
      )}

      <div className="mb-10">
        <h3 className="text-lg font-bold uppercase tracking-widest mb-4 text-gray-800 border-b-2 border-gray-300 pb-1">
          Contact
        </h3>
        <div className="space-y-3 text-sm">
          {personalInfo.phone && (
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-700" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.address && (
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-gray-700" />
              <span>{personalInfo.address}</span>
            </div>
          )}
          {personalInfo.email && (
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-700" />
              <span className="break-all">{personalInfo.email}</span>
            </div>
          )}
        </div>
      </div>

      {skills.length > 0 && (
        <div className="mb-10">
          <h3 className="text-lg font-bold uppercase tracking-widest mb-4 text-gray-800 border-b-2 border-gray-300 pb-1">
            Skills
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 marker:text-gray-400">
            {skills.map((skill) => (
              <li key={skill.id}>{skill.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  // === Banner (rendered every page) ===
  const bannerContent = (
    <div
      style={{
        height: "100%",
        backgroundColor: accentColor,
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-end",
        color: PALETTE.white,
        boxSizing: "border-box",
      }}
    >
      <div className="w-full pr-8 text-right">
        <h1 className="text-5xl font-bold mb-2 tracking-wide leading-tight">
          {personalInfo.fullName.split(" ").map((word, i) => (
            <span key={i} className="block">
              {word.toUpperCase()}
            </span>
          ))}
        </h1>
        <p className="text-xl font-medium tracking-widest uppercase opacity-90">
          {personalInfo.title}
        </p>
      </div>
    </div>
  );

  const blocks: TemplateBlock[] = [];

  if (personalInfo.summary) {
    blocks.push({
      id: "profile",
      kind: "section-item",
      content: (
        <div style={mainColumnStyle} className="mb-8">
          <h3 className="text-lg font-bold uppercase tracking-widest mb-3 text-gray-800 border-b-2 border-gray-200 pb-1">
            Professional Profile
          </h3>
          <p className="text-gray-600 leading-relaxed text-sm text-justify whitespace-pre-wrap">
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
          <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 border-b-2 border-gray-200 pb-1">
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
              <span className="text-sm text-gray-500">
                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
              </span>
            </div>
            <div className="text-md font-bold text-gray-700 mb-2">
              {exp.company}
              {exp.location && (
                <>
                  <span className="font-normal text-gray-400 mx-1">|</span>
                  <span className="text-sm font-normal text-gray-500">
                    {exp.location}
                  </span>
                </>
              )}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
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
          <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 border-b-2 border-gray-200 pb-1">
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
              <h4 className="font-bold text-lg text-gray-900">{edu.degree}</h4>
              <span className="text-sm text-gray-500">
                {edu.startDate} -{" "}
                {edu.current ? "Present" : edu.endDate || "Present"}
              </span>
            </div>
            <div className="text-md font-bold text-gray-700">
              {edu.institution}
            </div>
            {edu.description && (
              <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">
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
          color: PALETTE.textMuted,
        }}
      >
        Built by{" "}
        <span style={{ fontWeight: "bold", color: accentColor }}>
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
        background: PALETTE.sidebarBg,
        content: sidebarContent,
      },
      banner: {
        height: BANNER_HEIGHT_PX,
        content: bannerContent,
        repeatOnEveryPage: true,
      },
    },
  };
};
