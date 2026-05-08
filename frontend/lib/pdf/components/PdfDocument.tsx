import React from "react";
import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { TemplateSpec, SkillsItemSpec } from "../types";
import { fontSize, pdfFontFamily } from "../theme";
import { PdfHeader } from "./PdfHeader";
import { PdfSection } from "./PdfSection";

interface Props {
  spec: TemplateSpec;
}

/**
 * Main PDF Document.
 *
 * Layout strategy:
 * - All templates render as a single A4 page tree. React-PDF auto-paginates
 *   when content overflows; we use `wrap={false}` on tightly-bound items
 *   (experience entries, headers) to avoid mid-block splits.
 * - Sidebar layouts are rendered as a row: sidebar column + main column.
 *   The sidebar repeats automatically on every overflow page because we use
 *   the `fixed` prop on the sidebar.
 * - Banner layouts use a `fixed` Page-wide banner that prints on every page.
 */
export const PdfDocument: React.FC<Props> = ({ spec }) => {
  const { theme, margins, layout, sidebar, banner, header, sections, footer } =
    spec;

  const fonts = pdfFontFamily(theme.fontFamily);

  // Effective page padding accounts for the banner and sidebar.
  const pagePadding = {
    paddingTop: margins.topPt,
    paddingRight: margins.rightPt,
    paddingBottom: margins.bottomPt + 24, // breathing room for footer
    paddingLeft: margins.leftPt,
  };

  // Document-wide default text styles.
  const baseTextStyle = {
    fontFamily: fonts.regular,
    fontSize: fontSize(theme, 1),
    color: theme.textColor,
    lineHeight: theme.lineHeight,
  };

  // -----------------------------------------------------------------
  // Sidebar layout
  // -----------------------------------------------------------------
  if ((layout === "sidebar-left" || layout === "sidebar-right") && sidebar) {
    const sidebarWidthPct = `${Math.round(sidebar.widthFraction * 100)}%`;
    const isLeft = layout === "sidebar-left";

    return (
      <Document
        author={header.fullName}
        title={`${header.fullName || "Resume"} — ${spec.label}`}
      >
        <Page
          size="A4"
          style={{
            ...baseTextStyle,
            backgroundColor: theme.backgroundColor,
            flexDirection: "row",
          }}
        >
          {/*
           * Sidebar — rendered as `fixed` so it appears on every page.
           * The sidebar takes a fixed % width and full page height.
           */}
          <View
            fixed
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: isLeft ? 0 : "auto",
              right: isLeft ? "auto" : 0,
              width: sidebarWidthPct,
              backgroundColor: sidebar.background,
              padding: 18,
            }}
          >
            <SidebarContent spec={spec} />
          </View>

          {/* Main content column */}
          <View
            style={{
              flexGrow: 1,
              marginLeft: isLeft ? sidebarWidthPct : 0,
              marginRight: isLeft ? 0 : sidebarWidthPct,
              paddingTop: margins.topPt,
              paddingRight: margins.rightPt,
              paddingBottom: margins.bottomPt + 24,
              paddingLeft: margins.leftPt,
            }}
          >
            {/* Banner (above main content if present) */}
            {banner && (
              <View
                fixed={banner.repeatOnEveryPage !== false}
                style={{
                  marginLeft: -margins.leftPt,
                  marginRight: -margins.rightPt,
                  marginTop: -margins.topPt,
                  marginBottom: 16,
                  backgroundColor: banner.background,
                  height: banner.heightPt,
                  alignItems:
                    banner.align === "center"
                      ? "center"
                      : banner.align === "right"
                      ? "flex-end"
                      : "flex-start",
                  justifyContent: "center",
                  paddingHorizontal: 18,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.bold,
                    fontSize: fontSize(theme, 2.4),
                    color: banner.textColor,
                    letterSpacing: 0.4,
                  }}
                >
                  {header.fullName || "Your Name"}
                </Text>
                {header.title && (
                  <Text
                    style={{
                      fontFamily: fonts.regular,
                      fontSize: fontSize(theme, 1.1),
                      color: banner.textColor,
                      opacity: 0.9,
                      marginTop: 3,
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                    }}
                  >
                    {header.title}
                  </Text>
                )}
              </View>
            )}

            {/* Header (only if not absorbed by banner / sidebar) */}
            {!banner &&
              (!sidebar.contactsLocation ||
                sidebar.contactsLocation === "main") && (
                <PdfHeader header={header} theme={theme} />
              )}

            {/* Main column sections */}
            {sections.map((section) => (
              <PdfSection key={section.id} section={section} theme={theme} />
            ))}

            {footer && (
              <Text
                style={{
                  fontFamily: fonts.regular,
                  fontSize: fontSize(theme, 0.75),
                  color: theme.mutedColor,
                  textAlign: "center",
                  marginTop: 24,
                }}
              >
                {footer.text}
              </Text>
            )}

            {/* Page number — fixed bottom right */}
            <Text
              style={{
                position: "absolute",
                bottom: 18,
                right: margins.rightPt,
                fontSize: fontSize(theme, 0.7),
                color: theme.mutedColor,
              }}
              render={({ pageNumber, totalPages }) =>
                totalPages > 1 ? `${pageNumber} / ${totalPages}` : ""
              }
              fixed
            />
          </View>
        </Page>
      </Document>
    );
  }

  // -----------------------------------------------------------------
  // Single-column layout
  // -----------------------------------------------------------------
  return (
    <Document
      author={header.fullName}
      title={`${header.fullName || "Resume"} — ${spec.label}`}
    >
      <Page
        size="A4"
        style={{
          ...baseTextStyle,
          ...pagePadding,
          backgroundColor: theme.backgroundColor,
        }}
      >
        <PdfHeader header={header} theme={theme} />

        {sections.map((section) => (
          <PdfSection key={section.id} section={section} theme={theme} />
        ))}

        {footer && (
          <Text
            style={{
              fontFamily: fonts.regular,
              fontSize: fontSize(theme, 0.75),
              color: theme.mutedColor,
              textAlign: "center",
              marginTop: 24,
            }}
          >
            {footer.text}
          </Text>
        )}

        <Text
          style={{
            position: "absolute",
            bottom: 18,
            right: margins.rightPt,
            fontSize: fontSize(theme, 0.7),
            color: theme.mutedColor,
          }}
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `${pageNumber} / ${totalPages}` : ""
          }
          fixed
        />
      </Page>
    </Document>
  );
};

// =============================================================================
// Sidebar content (shared between sidebar-left and sidebar-right)
// =============================================================================

const SidebarContent: React.FC<{ spec: TemplateSpec }> = ({ spec }) => {
  const { sidebar, header, theme } = spec;
  if (!sidebar) return null;
  const fonts = pdfFontFamily(theme.fontFamily);

  // Apply sidebar text color
  const localTheme = { ...theme, textColor: sidebar.textColor, mutedColor: sidebar.textColor, accentColor: sidebar.textColor };

  return (
    <View>
      {/* Photo */}
      {sidebar.photoLocation === "sidebar" && header.photo && (
        <View
          style={{ alignItems: "center", marginBottom: 14 }}
        >
          <View
            style={{
              width: header.photo.sizePt,
              height: header.photo.sizePt,
              borderRadius:
                header.photo.shape === "circle"
                  ? 999
                  : header.photo.shape === "rounded"
                  ? 8
                  : 0,
              overflow: "hidden",
            }}
          >
            <SidebarPhoto url={header.photo.url} sizePt={header.photo.sizePt} />
          </View>
        </View>
      )}

      {/* Name + Title in sidebar (when photo is here too) */}
      {sidebar.photoLocation === "sidebar" && (
        <View style={{ marginBottom: 14 }}>
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: fontSize(theme, 1.6),
              color: sidebar.textColor,
            }}
          >
            {header.fullName}
          </Text>
          {header.title && (
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: fontSize(theme, 1),
                color: sidebar.textColor,
                opacity: 0.9,
                marginTop: 3,
              }}
            >
              {header.title}
            </Text>
          )}
        </View>
      )}

      {/* Contacts */}
      {sidebar.contactsLocation === "sidebar" &&
        header.contacts.length > 0 && (
          <View style={{ marginBottom: 14, gap: 5 }}>
            {header.contacts.map((c, i) => (
              <Text
                key={i}
                style={{
                  fontFamily: fonts.regular,
                  fontSize: fontSize(theme, 0.85),
                  color: sidebar.textColor,
                }}
              >
                {c.value}
              </Text>
            ))}
          </View>
        )}

      {/* Skills in sidebar */}
      {sidebar.skillsInSidebar && <SidebarSkills spec={spec} />}

      {/* Extra sections nested in sidebar */}
      {sidebar.extraSections?.map((section) => (
        <PdfSection key={section.id} section={section} theme={localTheme} />
      ))}
    </View>
  );
};

// Inline photo helper to keep the sidebar self-contained. React-PDF's
// <Image> doesn't accept an `alt` prop; the lint rule below targets HTML.
const SidebarPhoto: React.FC<{ url: string; sizePt: number }> = ({
  url,
  sizePt,
}) => (
  // eslint-disable-next-line jsx-a11y/alt-text
  <Image
    src={url}
    style={{
      width: sizePt,
      height: sizePt,
      objectFit: "cover",
    }}
  />
);

const SidebarSkills: React.FC<{ spec: TemplateSpec }> = ({ spec }) => {
  const { sidebar, theme, sections } = spec;
  if (!sidebar) return null;
  const fonts = pdfFontFamily(theme.fontFamily);
  const skillsSection = sections.find((s) =>
    s.items.some((item) => item.type === "skills"),
  );
  if (!skillsSection) return null;
  const skillsItem = skillsSection.items.find(
    (i): i is SkillsItemSpec => i.type === "skills",
  );
  if (!skillsItem) return null;
  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          fontFamily: fonts.bold,
          fontSize: fontSize(theme, 1),
          color: sidebar.textColor,
          textTransform: "uppercase",
          letterSpacing: 1.4,
          marginBottom: 6,
          borderBottomWidth: 1,
          borderBottomColor: sidebar.textColor,
          paddingBottom: 3,
        }}
      >
        {skillsSection.title?.label ?? "Skills"}
      </Text>
      <View style={{ gap: 3 }}>
        {skillsItem.items.map((s, i) => (
          <Text
            key={i}
            style={{
              fontFamily: fonts.regular,
              fontSize: fontSize(theme, 0.85),
              color: sidebar.textColor,
            }}
          >
            • {s.name}
          </Text>
        ))}
      </View>
    </View>
  );
};
