import React from "react";
import { CVState, CVDesignSettings } from "@/types/cv";
import { TemplateBlock, TemplateGenerator } from "./types";
import { Mail, Phone, MapPin, Code2 } from "lucide-react";

/**
 * Engineer template
 *
 * Built for software / data / hardware engineers. Distinctive features:
 *  - Header with monospace email + a small `<Code2>` accent.
 *  - Skills section is the FIRST content block (engineers are often filtered
 *    on stack), rendered as a 2-column dense grid with optional level bars.
 *  - Experience uses a left accent bar with monospace dates.
 *
 * Stays readable to ATS parsers because the skills grid is just a flexbox of
 * pills (no <table>, no images, no graphics).
 */
export const getEngineerTemplateBlocks: TemplateGenerator = (
  data: CVState,
  settings: CVDesignSettings,
) => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;
  const blocks: TemplateBlock[] = [];

  const fontStack =
    fontFamily === "serif"
      ? "Georgia, serif"
      : fontFamily === "mono"
      ? "'JetBrains Mono', 'Fira Code', 'Courier New', monospace"
      : "'Inter', 'SF Pro Display', system-ui, sans-serif";

  const monoStack =
    "'JetBrains Mono', 'Fira Code', 'Courier New', monospace";

  const baseStyle: React.CSSProperties = {
    fontFamily: fontStack,
    fontSize: `${0.9 * scale}rem`,
    lineHeight: 1.55,
    color: "#0f172a",
  };

  const sectionTitle = (label: string, icon?: React.ReactNode) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
      }}
    >
      <span
        style={{
          width: 4,
          height: 18,
          backgroundColor: themeColor,
          borderRadius: 2,
        }}
      />
      <h3
        style={{
          fontSize: `${1.1 * scale}rem`,
          fontWeight: 700,
          color: "#0f172a",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: 0,
        }}
      >
        {label}
      </h3>
      {icon}
    </div>
  );

  // Header
  blocks.push({
    id: "header",
    kind: "atomic",
    content: (
      <div style={{ ...baseStyle, marginBottom: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            paddingBottom: 12,
            borderBottom: `2px solid ${themeColor}`,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: `${2.2 * scale}rem`,
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {personalInfo.fullName || "Your Name"}
            </h1>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: `${1.05 * scale}rem`,
                color: themeColor,
                fontWeight: 600,
              }}
            >
              {personalInfo.title || "Software Engineer"}
            </p>
          </div>
          <Code2 size={30} color={themeColor} strokeWidth={1.5} />
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
            marginTop: 10,
            fontSize: `${0.85 * scale}rem`,
            color: "#475569",
          }}
        >
          {personalInfo.email && (
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Mail size={13} />
              <span style={{ fontFamily: monoStack }}>
                {personalInfo.email}
              </span>
            </span>
          )}
          {personalInfo.phone && (
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Phone size={13} />
              <span>{personalInfo.phone}</span>
            </span>
          )}
          {personalInfo.address && (
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <MapPin size={13} />
              <span>{personalInfo.address}</span>
            </span>
          )}
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
          {sectionTitle("About")}
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
            {personalInfo.summary}
          </p>
        </div>
      ),
    });
  }

  // Skills FIRST — engineers are often filtered on stack
  if (skills.length > 0) {
    blocks.push({
      id: "skills",
      kind: "section-item",
      content: (
        <div style={baseStyle}>
          {sectionTitle("Tech Stack")}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
            }}
          >
            {skills.map((s) => (
              <div
                key={s.id}
                style={{
                  fontFamily: monoStack,
                  fontSize: `${0.78 * scale}rem`,
                  padding: "5px 10px",
                  border: `1px solid ${themeColor}`,
                  borderRadius: 4,
                  color: themeColor,
                  textAlign: "center",
                  backgroundColor: `${themeColor}0d`,
                }}
              >
                {s.name}
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }

  // Experience
  if (experience.length > 0) {
    blocks.push({
      id: "experience-title",
      kind: "section-title",
      content: <div style={baseStyle}>{sectionTitle("Experience")}</div>,
    });

    experience.forEach((exp) => {
      const dates = `${exp.startDate}${
        exp.endDate || exp.current ? " → " : ""
      }${exp.current ? "Present" : exp.endDate || "Present"}`;
      blocks.push({
        id: `exp-${exp.id}`,
        kind: "section-item",
        content: (
          <div
            style={{
              ...baseStyle,
              borderLeft: `2px solid ${themeColor}`,
              paddingLeft: 14,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 2,
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: `${1.05 * scale}rem` }}>
                {exp.position}{" "}
                <span style={{ color: themeColor }}>@ {exp.company}</span>
              </div>
              <div
                style={{
                  fontFamily: monoStack,
                  fontSize: `${0.78 * scale}rem`,
                  color: "#64748b",
                  whiteSpace: "nowrap",
                }}
              >
                {dates}
              </div>
            </div>
            {exp.location && (
              <div
                style={{
                  fontSize: `${0.8 * scale}rem`,
                  color: "#64748b",
                  marginBottom: 4,
                }}
              >
                {exp.location}
              </div>
            )}
            {exp.description && (
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  margin: "4px 0 0 0",
                  fontSize: `${0.9 * scale}rem`,
                  color: "#334155",
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
      content: <div style={baseStyle}>{sectionTitle("Education")}</div>,
    });

    education.forEach((edu) => {
      const dates = `${edu.startDate}${
        edu.endDate || edu.current ? " → " : ""
      }${edu.current ? "Present" : edu.endDate || "Present"}`;
      blocks.push({
        id: `edu-${edu.id}`,
        kind: "section-item",
        content: (
          <div
            style={{
              ...baseStyle,
              borderLeft: `2px solid ${themeColor}`,
              paddingLeft: 14,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 700 }}>{edu.institution}</div>
              <div
                style={{
                  fontFamily: monoStack,
                  fontSize: `${0.78 * scale}rem`,
                  color: "#64748b",
                  whiteSpace: "nowrap",
                }}
              >
                {dates}
              </div>
            </div>
            <div style={{ color: themeColor, fontWeight: 600 }}>
              {edu.degree}
            </div>
            {edu.description && (
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  margin: "4px 0 0 0",
                  fontSize: `${0.9 * scale}rem`,
                  color: "#334155",
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

  blocks.push({
    id: "footer",
    kind: "footer",
    content: (
      <div
        style={{
          ...baseStyle,
          marginTop: "1.5rem",
          textAlign: "center",
          fontFamily: monoStack,
          fontSize: "0.7rem",
          color: "#94a3b8",
        }}
      >
        {"// Built by "}
        <span style={{ fontWeight: "bold", color: themeColor }}>
          oneshotcv.art
        </span>
        {" with love"}
      </div>
    ),
  });

  return blocks;
};
