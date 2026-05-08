import React from "react";
import { CVState, CVDesignSettings } from "@/types/cv";
import { TemplateBlock, TemplateGenerator } from "./types";
import { Mail, Phone, MapPin } from "lucide-react";

/**
 * Timeline template
 *
 * Consultant-style resume with a vertical timeline running down the left side
 * of every Experience and Education item. Each entry has a colored dot anchor
 * + dates above + body content.
 *
 * Visually distinctive but still single-column, so ATS-safe.
 */
export const getTimelineTemplateBlocks: TemplateGenerator = (
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
      ? "'Courier New', monospace"
      : "ui-sans-serif, system-ui, sans-serif";

  const baseStyle: React.CSSProperties = {
    fontFamily: fontStack,
    fontSize: `${0.92 * scale}rem`,
    lineHeight: 1.55,
    color: "#1f2937",
  };

  const sectionTitle = (label: string) => (
    <div style={{ marginBottom: 12 }}>
      <h3
        style={{
          fontSize: `${1.15 * scale}rem`,
          fontWeight: 700,
          color: themeColor,
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </h3>
      <div
        style={{
          height: 2,
          width: 40,
          backgroundColor: themeColor,
          marginTop: 4,
        }}
      />
    </div>
  );

  const TimelineItem: React.FC<{
    dates: string;
    title: React.ReactNode;
    subtitle: React.ReactNode;
    description?: string;
    isLast?: boolean;
  }> = ({ dates, title, subtitle, description }) => (
    <div
      style={{
        position: "relative",
        paddingLeft: 24,
        paddingBottom: 14,
        borderLeft: `2px solid ${themeColor}25`,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: -7,
          top: 4,
          width: 12,
          height: 12,
          borderRadius: 999,
          backgroundColor: themeColor,
          border: "2px solid white",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
        }}
      />
      <div
        style={{
          fontSize: `${0.78 * scale}rem`,
          color: themeColor,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 2,
        }}
      >
        {dates}
      </div>
      <div style={{ fontWeight: 700, fontSize: `${1.05 * scale}rem` }}>
        {title}
      </div>
      <div
        style={{
          color: "#4b5563",
          marginBottom: description ? 4 : 0,
        }}
      >
        {subtitle}
      </div>
      {description && (
        <p
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            fontSize: `${0.88 * scale}rem`,
            color: "#374151",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );

  // Header
  blocks.push({
    id: "header",
    kind: "atomic",
    content: (
      <div style={{ ...baseStyle, marginBottom: 24 }}>
        <h1
          style={{
            fontSize: `${2.6 * scale}rem`,
            fontWeight: 300,
            color: "#0f172a",
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          {personalInfo.fullName || "Your Name"}
        </h1>
        <p
          style={{
            margin: "6px 0 12px 0",
            fontSize: `${1.15 * scale}rem`,
            color: themeColor,
            fontWeight: 500,
            letterSpacing: "0.04em",
          }}
        >
          {personalInfo.title}
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            fontSize: `${0.85 * scale}rem`,
            color: "#6b7280",
          }}
        >
          {personalInfo.email && (
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Mail size={13} />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Phone size={13} />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.address && (
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <MapPin size={13} />
              {personalInfo.address}
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

  // Experience
  if (experience.length > 0) {
    blocks.push({
      id: "experience-title",
      kind: "section-title",
      content: <div style={baseStyle}>{sectionTitle("Experience")}</div>,
    });

    experience.forEach((exp, idx) => {
      const dates = `${exp.startDate}${
        exp.endDate || exp.current ? " — " : ""
      }${exp.current ? "Present" : exp.endDate || "Present"}`;
      blocks.push({
        id: `exp-${exp.id}`,
        kind: "section-item",
        content: (
          <div style={baseStyle}>
            <TimelineItem
              dates={dates}
              title={exp.position}
              subtitle={
                <>
                  <span
                    style={{ color: themeColor, fontWeight: 600 }}
                  >
                    {exp.company}
                  </span>
                  {exp.location && (
                    <span style={{ color: "#9ca3af" }}>
                      {" · "}
                      {exp.location}
                    </span>
                  )}
                </>
              }
              description={exp.description || undefined}
              isLast={idx === experience.length - 1}
            />
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

    education.forEach((edu, idx) => {
      const dates = `${edu.startDate}${
        edu.endDate || edu.current ? " — " : ""
      }${edu.current ? "Present" : edu.endDate || "Present"}`;
      blocks.push({
        id: `edu-${edu.id}`,
        kind: "section-item",
        content: (
          <div style={baseStyle}>
            <TimelineItem
              dates={dates}
              title={edu.institution}
              subtitle={
                <span style={{ color: themeColor, fontWeight: 600 }}>
                  {edu.degree}
                </span>
              }
              description={edu.description || undefined}
              isLast={idx === education.length - 1}
            />
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
          {sectionTitle("Skills")}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {skills.map((s) => (
              <span
                key={s.id}
                style={{
                  padding: "4px 11px",
                  borderRadius: 999,
                  backgroundColor: `${themeColor}10`,
                  color: themeColor,
                  fontSize: `${0.83 * scale}rem`,
                  fontWeight: 500,
                }}
              >
                {s.name}
              </span>
            ))}
          </div>
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
          fontSize: "0.72rem",
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
