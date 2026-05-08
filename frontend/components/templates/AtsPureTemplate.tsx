import React from "react";
import { CVState, CVDesignSettings } from "@/types/cv";
import { TemplateBlock, TemplateGenerator } from "./types";

/**
 * ATS-Pure template
 *
 * Maximum-compatibility template designed to be parsed cleanly by Applicant
 * Tracking Systems (Workday, Greenhouse, Lever, Taleo, iCIMS, BambooHR, etc.).
 *
 * Design rules:
 *  - Single column, top-to-bottom flow only.
 *  - Black text on white. No background colors. No gradients.
 *  - One font family throughout (Arial / Helvetica). No icons (icons confuse
 *    OCR parsers).
 *  - Standard section labels in capital letters, single underline.
 *  - Dates expressed as plain text on the same line as company/institution.
 *  - No tables, columns, headers/footers, text boxes, or graphics.
 *
 * The user's `themeColor` and `fontFamily` settings are intentionally ignored
 * because they reduce ATS parse rate. The point of this template is
 * predictability across parsers.
 */
export const getAtsPureTemplateBlocks: TemplateGenerator = (
  data: CVState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _settings: CVDesignSettings,
) => {
  const { personalInfo, education, experience, skills } = data;
  const blocks: TemplateBlock[] = [];

  const fontFamily = "Arial, Helvetica, sans-serif";
  const baseStyle: React.CSSProperties = {
    fontFamily,
    fontSize: "11pt",
    lineHeight: 1.4,
    color: "#000000",
  };

  const titleStyle: React.CSSProperties = {
    ...baseStyle,
    fontSize: "11pt",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #000000",
    paddingBottom: 2,
    marginBottom: 6,
  };

  // Header
  blocks.push({
    id: "header",
    kind: "atomic",
    content: (
      <div style={baseStyle}>
        <div
          style={{
            fontSize: "18pt",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 4,
          }}
        >
          {personalInfo.fullName || "YOUR NAME"}
        </div>
        {personalInfo.title && (
          <div
            style={{ fontSize: "12pt", fontWeight: 400, marginBottom: 6 }}
          >
            {personalInfo.title}
          </div>
        )}
        <div style={{ fontSize: "10.5pt" }}>
          {[
            personalInfo.email,
            personalInfo.phone,
            personalInfo.address,
          ]
            .filter(Boolean)
            .join(" | ")}
        </div>
      </div>
    ),
  });

  // Summary
  if (personalInfo.summary) {
    blocks.push({
      id: "summary",
      kind: "section-item",
      content: (
        <div style={baseStyle}>
          <div style={titleStyle}>Summary</div>
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
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
      kind: "section-title",
      content: (
        <div style={baseStyle}>
          <div style={titleStyle}>Professional Experience</div>
        </div>
      ),
    });

    experience.forEach((exp) => {
      const dates = `${exp.startDate}${
        exp.startDate || exp.endDate ? " – " : ""
      }${exp.current ? "Present" : exp.endDate || "Present"}`;
      blocks.push({
        id: `exp-${exp.id}`,
        kind: "section-item",
        content: (
          <div style={baseStyle}>
            <div style={{ fontWeight: 700 }}>{exp.position}</div>
            <div style={{ fontSize: "10.5pt" }}>
              {[exp.company, exp.location, dates]
                .filter(Boolean)
                .join(" | ")}
            </div>
            {exp.description && (
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  margin: "4px 0 0 0",
                }}
              >
                {exp.description}
              </p>
            )}
          </div>
        ),
      });
    });
  }

  // Education
  if (education.length > 0) {
    blocks.push({
      id: "education-title",
      kind: "section-title",
      content: (
        <div style={baseStyle}>
          <div style={titleStyle}>Education</div>
        </div>
      ),
    });

    education.forEach((edu) => {
      const dates = `${edu.startDate}${
        edu.startDate || edu.endDate ? " – " : ""
      }${edu.current ? "Present" : edu.endDate || "Present"}`;
      blocks.push({
        id: `edu-${edu.id}`,
        kind: "section-item",
        content: (
          <div style={baseStyle}>
            <div style={{ fontWeight: 700 }}>{edu.institution}</div>
            <div style={{ fontSize: "10.5pt" }}>
              {[edu.degree, dates].filter(Boolean).join(" | ")}
            </div>
            {edu.description && (
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  margin: "4px 0 0 0",
                }}
              >
                {edu.description}
              </p>
            )}
          </div>
        ),
      });
    });
  }

  // Skills — flat comma-separated list (most ATS-friendly format)
  if (skills.length > 0) {
    blocks.push({
      id: "skills",
      kind: "section-item",
      content: (
        <div style={baseStyle}>
          <div style={titleStyle}>Skills</div>
          <p style={{ margin: 0 }}>
            {skills.map((s) => s.name).join(", ")}
          </p>
        </div>
      ),
    });
  }

  return blocks;
};
