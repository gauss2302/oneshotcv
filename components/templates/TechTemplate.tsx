import React from "react";
import { CVState, CVDesignSettings } from "@/types/cv";
import { TemplateBlock, TemplateGenerator } from "./types";
import { Mail, Phone, MapPin, Code, Github } from "lucide-react";

export const getTechTemplateBlocks: TemplateGenerator = (
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
        ? "'Courier New', 'Fira Code', monospace"
        : "'Inter', 'SF Pro Display', system-ui, sans-serif",
    fontSize: `${0.9 * scale}rem`,
    lineHeight: 1.6,
    color: "#1f2937",
  };

  // Header with tech aesthetic
  blocks.push({
    id: "header",
    content: (
      <div className="mb-8" style={containerStyle}>
        <div className="flex items-start gap-6">
          {personalInfo.photo && (
            <img
              src={personalInfo.photo.url}
              alt={personalInfo.fullName}
              className="w-28 h-28 rounded-lg object-cover border-2"
              style={{ borderColor: themeColor }}
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1
                className="text-4xl font-bold text-gray-900"
                style={{ color: themeColor }}
              >
                {personalInfo.fullName}
              </h1>
              <Code size={20} className="text-gray-400" />
            </div>
            <p className="text-xl font-medium text-gray-600 mb-4">
              {personalInfo.title}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {personalInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  <span className="font-mono">{personalInfo.email}</span>
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
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
            <h3 className="text-lg font-bold text-gray-900">About</h3>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-gray-200">
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
        <div className="mb-4" style={containerStyle}>
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
            <h3 className="text-lg font-bold text-gray-900">Experience</h3>
          </div>
        </div>
      ),
    });

    experience.forEach((exp) => {
      blocks.push({
        id: `exp-${exp.id}`,
        content: (
          <div
            className="mb-5 pl-3 border-l-2 border-gray-200"
            style={containerStyle}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-gray-900 text-lg">
                  {exp.position}
                </h4>
                <div
                  className="text-gray-700 font-medium"
                  style={{ color: themeColor }}
                >
                  {exp.company}
                </div>
              </div>
              <span className="text-sm text-gray-500 font-mono whitespace-nowrap">
                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
              </span>
            </div>
            {exp.location && (
              <p className="text-sm text-gray-500 mb-2">{exp.location}</p>
            )}
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
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
        <div className="mb-4" style={containerStyle}>
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
            <h3 className="text-lg font-bold text-gray-900">Education</h3>
          </div>
        </div>
      ),
    });

    education.forEach((edu) => {
      blocks.push({
        id: `edu-${edu.id}`,
        content: (
          <div
            className="mb-4 pl-3 border-l-2 border-gray-200"
            style={containerStyle}
          >
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-bold text-gray-900">{edu.institution}</h4>
              <span className="text-sm text-gray-500 font-mono whitespace-nowrap">
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

  // Skills
  if (skills.length > 0) {
    blocks.push({
      id: "skills",
      content: (
        <div className="mb-6" style={containerStyle}>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
            <h3 className="text-lg font-bold text-gray-900">Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2 pl-3">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1.5 rounded-md text-sm font-medium border"
                style={{
                  backgroundColor: `${themeColor}10`,
                  borderColor: themeColor,
                  color: themeColor,
                }}
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
