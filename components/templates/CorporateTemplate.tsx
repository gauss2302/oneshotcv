import React from "react";
import { CVState, CVDesignSettings } from "@/types/cv";
import { TemplateBlock, TemplateGenerator } from "./types";
import { Mail, Phone, MapPin, Briefcase } from "lucide-react";

export const getCorporateTemplateBlocks: TemplateGenerator = (
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
        : "'Arial', 'Helvetica', sans-serif",
    fontSize: `${0.9 * scale}rem`,
    lineHeight: 1.6,
    color: "#1f2937",
  };

  // Professional header with subtle styling
  blocks.push({
    id: "header",
    content: (
      <div className="mb-8" style={containerStyle}>
        <div className="border-b-4 pb-4" style={{ borderColor: themeColor }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1
                className="text-4xl font-bold text-gray-900 mb-2"
                style={{ color: themeColor }}
              >
                {personalInfo.fullName}
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                {personalInfo.title}
              </p>
            </div>
            {personalInfo.photo && (
              <img
                src={personalInfo.photo.url}
                alt={personalInfo.fullName}
                className="w-32 h-32 rounded object-cover border-2"
                style={{ borderColor: themeColor }}
              />
            )}
          </div>
          <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600">
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
      </div>
    ),
  });

  // Summary
  if (personalInfo.summary) {
    blocks.push({
      id: "summary",
      content: (
        <div className="mb-6" style={containerStyle}>
          <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wider">
            Executive Summary
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
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
          <div className="flex items-center gap-3">
            <Briefcase size={20} style={{ color: themeColor }} />
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
              Professional Experience
            </h3>
          </div>
          <div
            className="h-0.5 w-20 mt-2"
            style={{ backgroundColor: themeColor }}
          />
        </div>
      ),
    });

    experience.forEach((exp) => {
      blocks.push({
        id: `exp-${exp.id}`,
        content: (
          <div className="mb-5" style={containerStyle}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-gray-900 text-lg">
                  {exp.position}
                </h4>
                <div
                  className="text-gray-700 font-semibold"
                  style={{ color: themeColor }}
                >
                  {exp.company}
                </div>
              </div>
              <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
              </span>
            </div>
            {exp.location && (
              <p className="text-sm text-gray-500 mb-2 italic">
                {exp.location}
              </p>
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
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
            Education
          </h3>
          <div
            className="h-0.5 w-20 mt-2"
            style={{ backgroundColor: themeColor }}
          />
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
            <div className="text-gray-700 font-medium">{edu.degree}</div>
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
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-3">
            Core Competencies
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 text-center"
              >
                {skill.name}
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }

  return blocks;
};
