import React from "react";
import { CVState, CVDesignSettings } from "@/types/cv";
import { TemplateBlock, TemplateGenerator } from "./types";
import { Mail, Phone, MapPin } from "lucide-react";

export const getCompactTemplateBlocks: TemplateGenerator = (
  data: CVState,
  settings: CVDesignSettings
) => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;
  const blocks: TemplateBlock[] = [];

  const containerStyle = {
    fontFamily:
      fontFamily === "serif"
        ? "Georgia, serif"
        : fontFamily === "mono"
        ? "Courier New, monospace"
        : "ui-sans-serif, system-ui, sans-serif",
    fontSize: `${0.85 * scale}rem`,
    lineHeight: 1.4,
    color: "#1f2937",
  };

  // Compact header
  blocks.push({
    id: "header",
    content: (
      <div className="mb-5" style={containerStyle}>
        <div
          className="flex items-center justify-between border-b-2 pb-2"
          style={{ borderColor: themeColor }}
        >
          <div className="flex-1">
            <h1
              className="text-3xl font-bold text-gray-900 mb-1"
              style={{ color: themeColor }}
            >
              {personalInfo.fullName}
            </h1>
            <p className="text-lg text-gray-600">{personalInfo.title}</p>
          </div>
          {personalInfo.photo && (
            <img
              src={personalInfo.photo.url}
              alt={personalInfo.fullName}
              className="w-20 h-20 rounded object-cover border"
              style={{ borderColor: themeColor }}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail size={12} />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone size={12} />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.address && (
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span>{personalInfo.address}</span>
            </div>
          )}
        </div>
      </div>
    ),
  });

  // Summary (compact)
  if (personalInfo.summary) {
    blocks.push({
      id: "summary",
      content: (
        <div className="mb-4" style={containerStyle}>
          <h3
            className="text-base font-bold text-gray-900 mb-1 uppercase text-xs tracking-wide"
            style={{ color: themeColor }}
          >
            Summary
          </h3>
          <p className="text-gray-700 text-sm leading-snug whitespace-pre-wrap">
            {personalInfo.summary}
          </p>
        </div>
      ),
    });
  }

  // Experience (compact)
  if (experience.length > 0) {
    blocks.push({
      id: "experience-title",
      content: (
        <div className="mb-3" style={containerStyle}>
          <h3
            className="text-base font-bold text-gray-900 uppercase text-xs tracking-wide"
            style={{ color: themeColor }}
          >
            Experience
          </h3>
        </div>
      ),
    });

    experience.forEach((exp) => {
      blocks.push({
        id: `exp-${exp.id}`,
        content: (
          <div className="mb-3" style={containerStyle}>
            <div className="flex justify-between items-start mb-0.5">
              <div>
                <span className="font-bold text-gray-900 text-base">
                  {exp.position}
                </span>
                <span className="text-gray-600 mx-2">•</span>
                <span
                  className="text-gray-700 font-medium"
                  style={{ color: themeColor }}
                >
                  {exp.company}
                </span>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
              </span>
            </div>
            <p className="text-gray-600 text-xs leading-snug whitespace-pre-wrap ml-0">
              {exp.description}
            </p>
          </div>
        ),
      });
    });
  }

  // Education (compact)
  if (education.length > 0) {
    blocks.push({
      id: "education-title",
      content: (
        <div className="mb-3" style={containerStyle}>
          <h3
            className="text-base font-bold text-gray-900 uppercase text-xs tracking-wide"
            style={{ color: themeColor }}
          >
            Education
          </h3>
        </div>
      ),
    });

    education.forEach((edu) => {
      blocks.push({
        id: `edu-${edu.id}`,
        content: (
          <div className="mb-2" style={containerStyle}>
            <div className="flex justify-between items-baseline">
              <div>
                <span className="font-bold text-gray-900">
                  {edu.institution}
                </span>
                {edu.degree && (
                  <>
                    <span className="text-gray-600 mx-2">•</span>
                    <span className="text-gray-700">{edu.degree}</span>
                  </>
                )}
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {edu.startDate} - {edu.current ? "Present" : edu.endDate}
              </span>
            </div>
          </div>
        ),
      });
    });
  }

  // Skills (compact)
  if (skills.length > 0) {
    blocks.push({
      id: "skills",
      content: (
        <div className="mb-4" style={containerStyle}>
          <h3
            className="text-base font-bold text-gray-900 mb-2 uppercase text-xs tracking-wide"
            style={{ color: themeColor }}
          >
            Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      ),
    });
  }

  return blocks;
};
