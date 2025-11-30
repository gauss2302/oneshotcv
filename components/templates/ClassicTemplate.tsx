import React from "react";
import { CVState, CVDesignSettings } from "@/types/cv";
import { TemplateBlock, TemplateGenerator } from "./types";
import { Mail, Phone, MapPin } from "lucide-react";

const colors = {
  textMain: "#111827", // gray-900
  textSec: "#4b5563", // gray-600
  textMuted: "#6b7280", // gray-500
  border: "#1f2937", // gray-800
  borderLight: "#d1d5db", // gray-300
  bgBadge: "#f3f4f6", // gray-100
};

export const getClassicTemplateBlocks: TemplateGenerator = (
  data: CVState,
  settings: CVDesignSettings
) => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;
  const blocks: TemplateBlock[] = [];

  // Base styles based on settings
  const containerStyle = {
    fontFamily:
      fontFamily === "serif"
        ? "Georgia, serif"
        : fontFamily === "mono"
        ? "Courier New, monospace"
        : "ui-sans-serif, system-ui, sans-serif",
    fontSize: `${0.9 * scale}rem`, // Reduced base size + scale
    lineHeight: 1.5,
    color: "#1f2937", // gray-800
  };

  const headerStyle = {
    color: themeColor,
  };

  // Helper for section titles
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3
      className="text-lg font-bold uppercase tracking-wider border-b-2 mb-3 pb-1"
      style={{ ...headerStyle, borderColor: themeColor }}
    >
      {children}
    </h3>
  );

  // 1. Header Block
  blocks.push({
    id: "header",
    content: (
      <div className="mb-6 text-center" style={containerStyle}>
        <h1
          className="text-3xl font-bold text-gray-900 mb-2"
          style={{ color: themeColor }}
        >
          {personalInfo.fullName}
        </h1>
        <p className="text-xl text-gray-600 mb-3">{personalInfo.title}</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail size={14} />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone size={14} />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.address && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{personalInfo.address}</span>
            </div>
          )}
        </div>
      </div>
    ),
  });

  // 2. Summary Block
  if (personalInfo.summary) {
    blocks.push({
      id: "summary",
      content: (
        <div className="mb-6" style={containerStyle}>
          <SectionTitle>Professional Summary</SectionTitle>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {personalInfo.summary}
          </p>
        </div>
      ),
    });
  }

  // 3. Experience Blocks
  if (experience.length > 0) {
    blocks.push({
      id: "experience-title",
      content: (
        <div className="mb-4" style={containerStyle}>
          <SectionTitle>Work Experience</SectionTitle>
        </div>
      ),
    });

    experience.forEach((exp) => {
      blocks.push({
        id: `exp-${exp.id}`,
        content: (
          <div className="mb-4" style={containerStyle}>
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-bold text-gray-900 text-lg">
                {exp.position}
              </h4>
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
              </span>
            </div>
            <div
              className="text-gray-700 font-medium mb-2"
              style={{ color: themeColor }}
            >
              {exp.company}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {exp.description}
            </p>
          </div>
        ),
      });
    });
  }

  // 4. Education Blocks
  if (education.length > 0) {
    blocks.push({
      id: "education-title",
      content: (
        <div className="mb-4" style={containerStyle}>
          <SectionTitle>Education</SectionTitle>
        </div>
      ),
    });

    education.forEach((edu) => {
      blocks.push({
        id: `edu-${edu.id}`,
        content: (
          <div className="mb-4" style={containerStyle}>
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-bold text-gray-900">{edu.institution}</h4>
              <span className="text-sm text-gray-500 whitespace-nowrap">
                {edu.startDate} - {edu.current ? "Present" : edu.endDate}
              </span>
            </div>
            <div className="text-gray-700">{edu.degree}</div>
            {edu.description && (
              <p className="text-gray-600 text-sm mt-1">{edu.description}</p>
            )}
          </div>
        ),
      });
    });
  }

  // 5. Skills Block
  if (skills.length > 0) {
    blocks.push({
      id: "skills",
      content: (
        <div className="mb-6" style={containerStyle}>
          <SectionTitle>Skills</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      ),
    });
  }

  // Footer
  blocks.push({
    id: "footer",
    content: (
      <div
        style={{
          ...containerStyle,
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

  return blocks;
};
