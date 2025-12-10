import React from "react";
import { CVState, CVDesignSettings } from "@/types/cv";
import { TemplateBlock, TemplateGenerator } from "./types";
import { Mail, Phone, MapPin, GraduationCap } from "lucide-react";

export const getAcademicTemplateBlocks: TemplateGenerator = (
  data: CVState,
  settings: CVDesignSettings
) => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;
  const blocks: TemplateBlock[] = [];

  const containerStyle = {
    fontFamily:
      fontFamily === "serif"
        ? "'Times New Roman', Times, serif"
        : fontFamily === "mono"
        ? "Courier New, monospace"
        : "Georgia, 'Times New Roman', serif",
    fontSize: `${0.9 * scale}rem`,
    lineHeight: 1.8,
    color: "#1f2937",
  };

  // Centered header
  blocks.push({
    id: "header",
    content: (
      <div className="mb-8 text-center" style={containerStyle}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <GraduationCap size={24} style={{ color: themeColor }} />
          <h1
            className="text-4xl font-bold text-gray-900"
            style={{ color: themeColor }}
          >
            {personalInfo.fullName}
          </h1>
        </div>
        <p className="text-xl text-gray-700 mb-4 italic">
          {personalInfo.title}
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 border-t border-b border-gray-300 py-3">
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone size={14} />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.address && (
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{personalInfo.address}</span>
            </div>
          )}
        </div>
      </div>
    ),
  });

  // Summary
  if (personalInfo.summary) {
    blocks.push({
      id: "summary",
      content: (
        <div className="mb-6" style={containerStyle}>
          <h3
            className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide border-b-2 pb-2"
            style={{ borderColor: themeColor }}
          >
            Research Interests
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-justify">
            {personalInfo.summary}
          </p>
        </div>
      ),
    });
  }

  // Education first (academic CVs prioritize education)
  if (education.length > 0) {
    blocks.push({
      id: "education-title",
      content: (
        <div className="mb-4" style={containerStyle}>
          <h3
            className="text-lg font-bold text-gray-900 uppercase tracking-wide border-b-2 pb-2"
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
        content: (
          <div className="mb-5" style={containerStyle}>
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-bold text-gray-900 text-lg">{edu.degree}</h4>
              <span className="text-sm text-gray-500 whitespace-nowrap">
                {edu.startDate} - {edu.current ? "Present" : edu.endDate}
              </span>
            </div>
            <div className="text-gray-700 font-medium italic mb-2">
              {edu.institution}
            </div>
            {edu.description && (
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {edu.description}
              </p>
            )}
          </div>
        ),
      });
    });
  }

  // Experience
  if (experience.length > 0) {
    blocks.push({
      id: "experience-title",
      content: (
        <div className="mb-4" style={containerStyle}>
          <h3
            className="text-lg font-bold text-gray-900 uppercase tracking-wide border-b-2 pb-2"
            style={{ borderColor: themeColor }}
          >
            Professional Experience
          </h3>
        </div>
      ),
    });

    experience.forEach((exp) => {
      blocks.push({
        id: `exp-${exp.id}`,
        content: (
          <div className="mb-5" style={containerStyle}>
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-bold text-gray-900 text-lg">
                {exp.position}
              </h4>
              <span className="text-sm text-gray-500 whitespace-nowrap">
                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
              </span>
            </div>
            <div className="text-gray-700 font-medium italic mb-2">
              {exp.company}
              {exp.location && `, ${exp.location}`}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {exp.description}
            </p>
          </div>
        ),
      });
    });
  }

  // Skills
  if (skills.length > 0) {
    blocks.push({
      id: "skills",
      content: (
        <div className="mb-6" style={containerStyle}>
          <h3
            className="text-lg font-bold text-gray-900 uppercase tracking-wide border-b-2 pb-2 mb-3"
            style={{ borderColor: themeColor }}
          >
            Technical Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
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
