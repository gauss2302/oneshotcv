import React from "react";
import { CVState, CVDesignSettings } from "@/types/cv";
import { TemplateBlock, TemplateGenerator } from "./types";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

export const getDesignerTemplateBlocks: TemplateGenerator = (
  data: CVState,
  settings: CVDesignSettings
) => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;
  const blocks: TemplateBlock[] = [];

  // Colors from the image
  const colors = {
    sidebarBg: "#F9F5F0", // Beige
    headerBg: themeColor === "#3b82f6" ? "#E0B656" : themeColor, // Default to Gold if default blue is passed, else use user selection
    textMain: "#333333",
    textMuted: "#666666",
    white: "#FFFFFF",
  };

  // Base styles
  const baseStyle = {
    fontFamily:
      fontFamily === "serif"
        ? "Georgia, serif"
        : fontFamily === "mono"
        ? "Courier New, monospace"
        : "ui-sans-serif, system-ui, sans-serif",
    fontSize: `${0.9 * scale}rem`,
    lineHeight: 1.6,
    color: colors.textMain,
  };

  const sidebarWidth = "35%";
  const mainContentMargin = "38%"; // 35% + gap

  // 1. Layout Container (Sidebar + Header Background)
  blocks.push({
    id: "layout-container",
    content: (
      <div style={{ height: 0, overflow: "visible", position: "relative" }}>
        {/* Sidebar Background & Content */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: sidebarWidth,
            minHeight: "290mm",
            backgroundColor: colors.sidebarBg,
            padding: "2rem",
            boxSizing: "border-box",
            ...baseStyle,
          }}
        >
          {/* Photo */}
          {personalInfo.photo && (
            <div className="mb-8 flex justify-center">
              <img
                src={personalInfo.photo.url}
                alt={personalInfo.fullName}
                className="w-56 h-56 rounded-full object-cover border-4 border-white shadow-sm"
              />
            </div>
          )}

          {/* Contact */}
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

          {/* Skills */}
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

        {/* Header Background (Top Right) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: sidebarWidth,
            right: 0,
            height: "180px",
            backgroundColor: colors.headerBg,
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            color: colors.white,
          }}
        >
          <div className="w-full pr-8 text-right">
            <h1 className="text-5xl font-bold mb-2 font-serif tracking-wide">
              {personalInfo.fullName.split(" ").map((n, i) => (
                <span key={i} className="block">
                  {n.toUpperCase()}
                </span>
              ))}
            </h1>
            <p className="text-xl font-medium tracking-widest uppercase opacity-90">
              {personalInfo.title}
            </p>
          </div>
        </div>
      </div>
    ),
  });

  // 2. Main Content (Starts after header height)
  // 2. Main Content (Starts after header height)
  // Spacer block to push content below header
  blocks.push({
    id: "header-spacer",
    content: <div style={{ height: "240px" }} />,
  });

  // Profile
  if (personalInfo.summary) {
    blocks.push({
      id: "profile",
      content: (
        <div
          style={{ marginLeft: mainContentMargin, ...baseStyle }}
          className="mb-8"
        >
          <h3 className="text-lg font-bold uppercase tracking-widest mb-3 text-gray-800 border-b-2 border-gray-200 pb-1">
            Professional Profile
          </h3>
          <p className="text-gray-600 leading-relaxed text-sm text-justify">
            {personalInfo.summary}
          </p>
        </div>
      ),
    });
  }

  // Experience
  if (experience.length > 0) {
    blocks.push({
      id: "experience-title",
      content: (
        <div
          style={{ marginLeft: mainContentMargin, ...baseStyle }}
          className="mb-4"
        >
          <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 border-b-2 border-gray-200 pb-1">
            Experience
          </h3>
        </div>
      ),
    });

    experience.forEach((exp) => {
      blocks.push({
        id: `exp-${exp.id}`,
        content: (
          <div
            style={{ marginLeft: mainContentMargin, ...baseStyle }}
            className="mb-6"
          >
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-bold text-lg text-gray-900">
                {exp.position}
              </h4>
              <span className="text-sm text-gray-500">
                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
              </span>
            </div>
            <div className="text-md font-bold text-gray-700 mb-2">
              {exp.company}{" "}
              <span className="font-normal text-gray-400 mx-1">|</span>{" "}
              <span className="text-sm font-normal text-gray-500">
                New York, NY
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {exp.description}
            </p>
          </div>
        ),
      });
    });
  }

  // Education
  if (education.length > 0) {
    blocks.push({
      id: "education-title",
      content: (
        <div
          style={{ marginLeft: mainContentMargin, ...baseStyle }}
          className="mb-4"
        >
          <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 border-b-2 border-gray-200 pb-1">
            Education
          </h3>
        </div>
      ),
    });

    education.forEach((edu) => {
      blocks.push({
        id: `edu-${edu.id}`,
        content: (
          <div
            style={{ marginLeft: mainContentMargin, ...baseStyle }}
            className="mb-6"
          >
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-bold text-lg text-gray-900">{edu.degree}</h4>
              <span className="text-sm text-gray-500">
                {edu.startDate} - {edu.endDate || "Present"}
              </span>
            </div>
            <div className="text-md font-bold text-gray-700">
              {edu.institution}
            </div>
            {edu.description && (
              <p className="text-gray-600 text-sm mt-1">{edu.description}</p>
            )}
          </div>
        ),
      });
    });
  }

  return blocks;
};
