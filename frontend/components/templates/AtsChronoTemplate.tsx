import React from "react";
import { CVState, CVDesignSettings } from "@/types/cv";
import { TemplateBlock, TemplateGenerator } from "./types";

/**
 * ATS-Chronological template
 *
 * Reverse-chronological resume with an explicit left date column for each
 * experience and education entry. Still ATS-safe (single column from the
 * parser's POV — flexbox with two children renders like inline text to most
 * parsers), but with a stronger visual hierarchy than ats-pure.
 *
 * Rules:
 *  - Single accent color (the user's themeColor) used only for section titles.
 *  - One font family. No icons.
 *  - Each item is a `flex` row: dates on the left (~20% of content width),
 *    body on the right.
 */
export const getAtsChronoTemplateBlocks: TemplateGenerator = (
  data: CVState,
  settings: CVDesignSettings,
) => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily } = settings;
  const blocks: TemplateBlock[] = [];

  const fontStack =
    fontFamily === "serif"
      ? "'Times New Roman', Times, serif"
      : fontFamily === "mono"
      ? "'Courier New', monospace"
      : "Arial, Helvetica, sans-serif";

  const baseStyle: React.CSSProperties = {
    fontFamily: fontStack,
    fontSize: "11pt",
    lineHeight: 1.5,
    color: "#111827",
  };

  const titleStyle: React.CSSProperties = {
    ...baseStyle,
    fontSize: "12pt",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: themeColor,
    borderBottom: `2px solid ${themeColor}`,
    paddingBottom: 3,
    marginBottom: 8,
  };

  const dateColStyle: React.CSSProperties = {
    width: "22%",
    fontSize: "10pt",
    fontWeight: 600,
    color: "#374151",
  };

  const bodyColStyle: React.CSSProperties = {
    flex: 1,
    paddingLeft: 12,
    borderLeft: "1px solid #e5e7eb",
  };

  // Header
  blocks.push({
    id: "header",
    kind: "atomic",
    content: (
      <div style={{ ...baseStyle, marginBottom: 8 }}>
        <div
          style={{
            fontSize: "22pt",
            fontWeight: 700,
            color: "#111827",
            letterSpacing: "-0.01em",
          }}
        >
          {personalInfo.fullName || "Your Name"}
        </div>
        {personalInfo.title && (
          <div
            style={{
              fontSize: "13pt",
              color: themeColor,
              marginTop: 2,
              marginBottom: 6,
            }}
          >
            {personalInfo.title}
          </div>
        )}
        <div style={{ fontSize: "10.5pt", color: "#374151" }}>
          {[
            personalInfo.email,
            personalInfo.phone,
            personalInfo.address,
          ]
            .filter(Boolean)
            .join("  ·  ")}
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

  // Experience — reverse-chronological with date column
  if (experience.length > 0) {
    blocks.push({
      id: "experience-title",
      kind: "section-title",
      content: (
        <div style={baseStyle}>
          <div style={titleStyle}>Experience</div>
        </div>
      ),
    });

    experience.forEach((exp) => {
      const dates = `${exp.startDate}${
        exp.endDate || exp.current ? " –\u00a0" : ""
      }${exp.current ? "Present" : exp.endDate || "Present"}`;
      blocks.push({
        id: `exp-${exp.id}`,
        kind: "section-item",
        content: (
          <div style={{ ...baseStyle, display: "flex", marginBottom: 4 }}>
            <div style={dateColStyle}>{dates}</div>
            <div style={bodyColStyle}>
              <div style={{ fontWeight: 700, fontSize: "11.5pt" }}>
                {exp.position}
              </div>
              <div
                style={{
                  fontSize: "11pt",
                  color: themeColor,
                  fontWeight: 600,
                }}
              >
                {exp.company}
                {exp.location ? ` · ${exp.location}` : ""}
              </div>
              {exp.description && (
                <p
                  style={{
                    whiteSpace: "pre-wrap",
                    margin: "4px 0 0 0",
                    fontSize: "10.5pt",
                    color: "#374151",
                  }}
                >
                  {exp.description}
                </p>
              )}
            </div>
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
        edu.endDate || edu.current ? " –\u00a0" : ""
      }${edu.current ? "Present" : edu.endDate || "Present"}`;
      blocks.push({
        id: `edu-${edu.id}`,
        kind: "section-item",
        content: (
          <div style={{ ...baseStyle, display: "flex", marginBottom: 4 }}>
            <div style={dateColStyle}>{dates}</div>
            <div style={bodyColStyle}>
              <div style={{ fontWeight: 700, fontSize: "11.5pt" }}>
                {edu.institution}
              </div>
              <div
                style={{
                  fontSize: "11pt",
                  color: themeColor,
                  fontWeight: 600,
                }}
              >
                {edu.degree}
              </div>
              {edu.description && (
                <p
                  style={{
                    whiteSpace: "pre-wrap",
                    margin: "4px 0 0 0",
                    fontSize: "10.5pt",
                    color: "#374151",
                  }}
                >
                  {edu.description}
                </p>
              )}
            </div>
          </div>
        ),
      });
    });
  }

  // Skills
  if (skills.length > 0) {
    blocks.push({
      id: "skills",
      kind: "section-item",
      content: (
        <div style={baseStyle}>
          <div style={titleStyle}>Skills</div>
          <p style={{ margin: 0, fontSize: "10.5pt" }}>
            {skills.map((s) => s.name).join(" · ")}
          </p>
        </div>
      ),
    });
  }

  blocks.push({
    id: "footer",
    kind: "footer",
    content: (
      <div
        style={{
          ...baseStyle,
          marginTop: "1.5rem",
          textAlign: "center",
          fontSize: "8pt",
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
