import React from "react";
import { CVState, CVDesignSettings } from "@/types/cv";
import { TemplateBlock, TemplateGenerator } from "./types";
import { Mail, Phone, MapPin, Rocket } from "lucide-react";

export const getStartupTemplateBlocks: TemplateGenerator = (
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
        : "'Inter', 'SF Pro Display', system-ui, sans-serif",
    fontSize: `${0.9 * scale}rem`,
    lineHeight: 1.7,
    color: "#1f2937",
  };

  // Vibrant header
  blocks.push({
    id: "header",
    content: (
      <div className="mb-8" style={containerStyle}>
        <div
          className="rounded-2xl p-6 mb-4"
          style={{ backgroundColor: `${themeColor}15` }}
        >
          <div className="flex items-start gap-6">
            {personalInfo.photo && (
              <img
                src={personalInfo.photo.url}
                alt={personalInfo.fullName}
                className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Rocket size={20} style={{ color: themeColor }} />
                <h1
                  className="text-4xl font-extrabold text-gray-900"
                  style={{ color: themeColor }}
                >
                  {personalInfo.fullName}
                </h1>
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-4">
                {personalInfo.title}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
            className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"
            style={{ color: themeColor }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
            About
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
          <h3
            className="text-lg font-bold text-gray-900 flex items-center gap-2"
            style={{ color: themeColor }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
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
            className="mb-5 p-4 rounded-lg border-l-4"
            style={{
              borderLeftColor: themeColor,
              backgroundColor: `${themeColor}05`,
            }}
          >
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
          <h3
            className="text-lg font-bold text-gray-900 flex items-center gap-2"
            style={{ color: themeColor }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
            Education
          </h3>
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

  // Skills
  if (skills.length > 0) {
    blocks.push({
      id: "skills",
      content: (
        <div className="mb-6" style={containerStyle}>
          <h3
            className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"
            style={{ color: themeColor }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-4 py-2 rounded-full text-sm font-semibold shadow-sm"
                style={{
                  backgroundColor: themeColor,
                  color: "white",
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
