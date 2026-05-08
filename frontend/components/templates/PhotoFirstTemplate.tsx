import React from "react";
import { CVState, CVDesignSettings } from "@/types/cv";
import { TemplateBlock, TemplateGenerator } from "./types";
import { Mail, Phone, MapPin } from "lucide-react";

/**
 * Photo-First template
 *
 * Personal-portfolio inspired CV with a large circular photo as the visual
 * anchor at the top of page 1. Falls back to a tasteful initials avatar when
 * no photo is uploaded so the layout still feels intentional.
 *
 * Subsequent pages drop the giant photo (handled by the template returning
 * the photo as part of the `header` block, which only renders on page 1
 * thanks to the `kind: 'atomic'` marker keeping it on its starting page).
 */
export const getPhotoFirstTemplateBlocks: TemplateGenerator = (
  data: CVState,
  settings: CVDesignSettings,
) => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;
  const blocks: TemplateBlock[] = [];

  const fontStack =
    fontFamily === "serif"
      ? "'Playfair Display', Georgia, serif"
      : fontFamily === "mono"
      ? "'Courier New', monospace"
      : "ui-sans-serif, system-ui, sans-serif";

  const baseStyle: React.CSSProperties = {
    fontFamily: fontStack,
    fontSize: `${0.92 * scale}rem`,
    lineHeight: 1.6,
    color: "#1f2937",
  };

  // Initials fallback
  const initials = (personalInfo.fullName || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const sectionTitle = (label: string) => (
    <div
      style={{
        textAlign: "center",
        marginBottom: 14,
      }}
    >
      <h3
        style={{
          fontSize: `${1.25 * scale}rem`,
          fontWeight: 600,
          color: "#0f172a",
          margin: 0,
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </h3>
      <div
        style={{
          height: 2,
          width: 36,
          backgroundColor: themeColor,
          marginTop: 6,
          marginInline: "auto",
        }}
      />
    </div>
  );

  // Header — large photo + name + title
  blocks.push({
    id: "header",
    kind: "atomic",
    content: (
      <div style={{ ...baseStyle, textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: 999,
            margin: "0 auto 18px auto",
            backgroundColor: `${themeColor}15`,
            border: `4px solid ${themeColor}`,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {personalInfo.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={personalInfo.photo.url}
              alt={personalInfo.fullName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span
              style={{
                fontSize: "3.6rem",
                fontWeight: 700,
                color: themeColor,
                letterSpacing: "0.05em",
              }}
            >
              {initials || "?"}
            </span>
          )}
        </div>
        <h1
          style={{
            fontSize: `${2.6 * scale}rem`,
            fontWeight: 700,
            color: "#0f172a",
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
          }}
        >
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.title && (
          <p
            style={{
              margin: "6px 0 14px 0",
              fontSize: `${1.15 * scale}rem`,
              color: themeColor,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            {personalInfo.title}
          </p>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 18,
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
          {sectionTitle("Profile")}
          <p
            style={{
              whiteSpace: "pre-wrap",
              margin: 0,
              textAlign: "center",
              maxWidth: "42rem",
              marginInline: "auto",
              color: "#374151",
            }}
          >
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

    experience.forEach((exp) => {
      const dates = `${exp.startDate}${
        exp.endDate || exp.current ? " – " : ""
      }${exp.current ? "Present" : exp.endDate || "Present"}`;
      blocks.push({
        id: `exp-${exp.id}`,
        kind: "section-item",
        content: (
          <div style={baseStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
                marginBottom: 4,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: `${1.05 * scale}rem` }}>
                {exp.position}
              </div>
              <div
                style={{
                  fontSize: `${0.82 * scale}rem`,
                  color: "#9ca3af",
                  whiteSpace: "nowrap",
                }}
              >
                {dates}
              </div>
            </div>
            <div
              style={{
                fontSize: `${0.95 * scale}rem`,
                color: themeColor,
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              {exp.company}
              {exp.location && (
                <span style={{ color: "#9ca3af" }}> · {exp.location}</span>
              )}
            </div>
            {exp.description && (
              <p
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  fontSize: `${0.9 * scale}rem`,
                  color: "#374151",
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
        edu.endDate || edu.current ? " – " : ""
      }${edu.current ? "Present" : edu.endDate || "Present"}`;
      blocks.push({
        id: `edu-${edu.id}`,
        kind: "section-item",
        content: (
          <div style={baseStyle}>
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
                  fontSize: `${0.82 * scale}rem`,
                  color: "#9ca3af",
                }}
              >
                {dates}
              </div>
            </div>
            <div style={{ color: themeColor, fontWeight: 500 }}>
              {edu.degree}
            </div>
            {edu.description && (
              <p
                style={{
                  margin: "4px 0 0 0",
                  whiteSpace: "pre-wrap",
                  fontSize: `${0.9 * scale}rem`,
                  color: "#374151",
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
              justifyContent: "center",
              gap: 8,
            }}
          >
            {skills.map((s) => (
              <span
                key={s.id}
                style={{
                  padding: "5px 14px",
                  borderRadius: 999,
                  border: `1px solid ${themeColor}`,
                  color: themeColor,
                  fontSize: `${0.85 * scale}rem`,
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
