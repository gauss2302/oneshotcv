import React from "react";
import { View, Text } from "@react-pdf/renderer";
import {
  SectionSpec,
  SectionTitleSpec,
  ItemSpec,
  ExperienceItemSpec,
  EducationItemSpec,
  SummaryItemSpec,
  SkillsItemSpec,
  ThemeSpec,
} from "../types";
import { fontSize, pdfFontFamily, formatDateRange } from "../theme";
import { PdfIcon } from "./PdfIcons";

// =============================================================================
// Section title
// =============================================================================

interface TitleProps {
  title: SectionTitleSpec;
  theme: ThemeSpec;
}

export const PdfSectionTitle: React.FC<TitleProps> = ({ title, theme }) => {
  const fonts = pdfFontFamily(theme.fontFamily);
  const color = title.color ?? theme.accentColor;
  const labelText = title.uppercase
    ? title.label.toUpperCase()
    : title.label;

  switch (title.variant) {
    case "underline":
      return (
        <View
          style={{
            marginBottom: 8,
            borderBottomWidth: 1.5,
            borderBottomColor: color,
            paddingBottom: 3,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: fontSize(theme, 1.15),
              color,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {labelText}
          </Text>
        </View>
      );

    case "uppercase":
      return (
        <View style={{ marginBottom: 8 }}>
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: fontSize(theme, 1.1),
              color,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {labelText}
          </Text>
        </View>
      );

    case "filled-bar":
      return (
        <View
          style={{
            marginBottom: 8,
            backgroundColor: color,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: fontSize(theme, 1.1),
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: 1.4,
            }}
          >
            {labelText}
          </Text>
        </View>
      );

    case "ruled":
      return (
        <View
          style={{
            marginBottom: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <View
            style={{ flex: 1, height: 1, backgroundColor: theme.mutedColor, opacity: 0.4 }}
          />
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: fontSize(theme, 1),
              color: theme.mutedColor,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {labelText}
          </Text>
          <View
            style={{ flex: 1, height: 1, backgroundColor: theme.mutedColor, opacity: 0.4 }}
          />
        </View>
      );

    case "icon-prefixed":
      return (
        <View
          style={{
            marginBottom: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          {title.icon && (
            <PdfIcon
              name={title.icon}
              size={fontSize(theme, 1.1)}
              color={color}
            />
          )}
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: fontSize(theme, 1.1),
              color,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            {labelText}
          </Text>
        </View>
      );

    case "minimal":
    default:
      return (
        <View style={{ marginBottom: 6 }}>
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: fontSize(theme, 1.15),
              color,
            }}
          >
            {labelText}
          </Text>
        </View>
      );
  }
};

// =============================================================================
// Items
// =============================================================================

const PdfSummary: React.FC<{ item: SummaryItemSpec; theme: ThemeSpec }> = ({
  item,
  theme,
}) => {
  const fonts = pdfFontFamily(theme.fontFamily);
  return (
    <Text
      style={{
        fontFamily: item.italic ? fonts.italic : fonts.regular,
        fontSize: fontSize(theme, 1),
        color: theme.textColor,
        lineHeight: theme.lineHeight,
        textAlign: item.justify ? "justify" : theme.textAlign,
      }}
    >
      {item.text}
    </Text>
  );
};

const PdfExperience: React.FC<{
  item: ExperienceItemSpec;
  theme: ThemeSpec;
}> = ({ item, theme }) => {
  const fonts = pdfFontFamily(theme.fontFamily);
  const dateRange = formatDateRange(item.startDate, item.endDate, item.current);
  return (
    <View wrap={false} style={{ marginBottom: 2 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: fontSize(theme, 1.05),
              color: theme.textColor,
            }}
          >
            {item.position}
          </Text>
          <Text
            style={{
              fontFamily: fonts.regular,
              fontSize: fontSize(theme, 1),
              color: theme.accentColor,
              marginTop: 1,
            }}
          >
            {item.company}
            {item.location ? ` · ${item.location}` : ""}
          </Text>
        </View>
        {dateRange && (
          <Text
            style={{
              fontFamily: fonts.regular,
              fontSize: fontSize(theme, 0.85),
              color: theme.mutedColor,
            }}
          >
            {dateRange}
          </Text>
        )}
      </View>
      {item.description && (
        <Text
          style={{
            fontFamily: fonts.regular,
            fontSize: fontSize(theme, 0.95),
            color: theme.textColor,
            lineHeight: theme.lineHeight,
            marginTop: 4,
            textAlign: theme.textAlign,
          }}
        >
          {item.description}
        </Text>
      )}
    </View>
  );
};

const PdfEducation: React.FC<{
  item: EducationItemSpec;
  theme: ThemeSpec;
}> = ({ item, theme }) => {
  const fonts = pdfFontFamily(theme.fontFamily);
  const dateRange = formatDateRange(item.startDate, item.endDate, item.current);
  const primary = item.degreeFirst ? item.degree : item.institution;
  const secondary = item.degreeFirst ? item.institution : item.degree;
  return (
    <View wrap={false} style={{ marginBottom: 2 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: fontSize(theme, 1.05),
              color: theme.textColor,
            }}
          >
            {primary}
          </Text>
          {secondary && (
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: fontSize(theme, 1),
                color: theme.accentColor,
                marginTop: 1,
              }}
            >
              {secondary}
            </Text>
          )}
        </View>
        {dateRange && (
          <Text
            style={{
              fontFamily: fonts.regular,
              fontSize: fontSize(theme, 0.85),
              color: theme.mutedColor,
            }}
          >
            {dateRange}
          </Text>
        )}
      </View>
      {item.description && (
        <Text
          style={{
            fontFamily: fonts.regular,
            fontSize: fontSize(theme, 0.95),
            color: theme.textColor,
            lineHeight: theme.lineHeight,
            marginTop: 3,
          }}
        >
          {item.description}
        </Text>
      )}
    </View>
  );
};

const PdfSkills: React.FC<{ item: SkillsItemSpec; theme: ThemeSpec }> = ({
  item,
  theme,
}) => {
  const fonts = pdfFontFamily(theme.fontFamily);
  const baseSize = fontSize(theme, 0.95);

  if (item.layout === "inline") {
    return (
      <Text
        style={{
          fontFamily: fonts.regular,
          fontSize: baseSize,
          color: theme.textColor,
          lineHeight: theme.lineHeight,
        }}
      >
        {item.items.map((s) => s.name).join(" · ")}
      </Text>
    );
  }

  if (item.layout === "list") {
    return (
      <View style={{ gap: 2 }}>
        {item.items.map((s, i) => (
          <Text
            key={i}
            style={{
              fontFamily: fonts.regular,
              fontSize: baseSize,
              color: theme.textColor,
            }}
          >
            • {s.name}
          </Text>
        ))}
      </View>
    );
  }

  if (item.layout === "grid") {
    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {item.items.map((s, i) => (
          <View
            key={i}
            style={{
              width: "32%",
              padding: 4,
              borderWidth: 0.75,
              borderColor: theme.mutedColor,
              borderRadius: 3,
            }}
          >
            <Text
              style={{
                fontSize: baseSize,
                color: theme.textColor,
                textAlign: "center",
              }}
            >
              {s.name}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  if (item.layout === "rated") {
    return (
      <View style={{ gap: 4 }}>
        {item.items.map((s, i) => {
          const level = Math.max(0, Math.min(5, s.level ?? 3));
          return (
            <View
              key={i}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.regular,
                  fontSize: baseSize,
                  color: theme.textColor,
                }}
              >
                {s.name}
              </Text>
              <View style={{ flexDirection: "row", gap: 2 }}>
                {[0, 1, 2, 3, 4].map((slot) => (
                  <View
                    key={slot}
                    style={{
                      width: 16,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor:
                        slot < level ? theme.accentColor : "#e5e7eb",
                    }}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  // Default: pills
  const filled = item.style === "filled";
  const outlined = item.style === "outlined";
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 5,
      }}
    >
      {item.items.map((s, i) => (
        <View
          key={i}
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: filled
              ? theme.accentColor
              : outlined
              ? "transparent"
              : "#f3f4f6",
            borderWidth: outlined ? 1 : 0,
            borderColor: outlined ? theme.accentColor : "transparent",
          }}
        >
          <Text
            style={{
              fontFamily: fonts.regular,
              fontSize: baseSize,
              color: filled
                ? "#ffffff"
                : outlined
                ? theme.accentColor
                : theme.textColor,
            }}
          >
            {s.name}
          </Text>
        </View>
      ))}
    </View>
  );
};

// =============================================================================
// Item dispatcher
// =============================================================================

export const PdfItem: React.FC<{ item: ItemSpec; theme: ThemeSpec }> = ({
  item,
  theme,
}) => {
  switch (item.type) {
    case "summary":
      return <PdfSummary item={item} theme={theme} />;
    case "experience":
      return <PdfExperience item={item} theme={theme} />;
    case "education":
      return <PdfEducation item={item} theme={theme} />;
    case "skills":
      return <PdfSkills item={item} theme={theme} />;
    default: {
      // Exhaustive check: any future item type will fail typecheck here.
      const _exhaustive: never = item;
      void _exhaustive;
      return null;
    }
  }
};

// =============================================================================
// Section
// =============================================================================

export const PdfSection: React.FC<{ section: SectionSpec; theme: ThemeSpec }> = ({
  section,
  theme,
}) => {
  return (
    <View
      style={{ marginBottom: theme.sectionGapPt }}
      wrap={section.items.length > 1}
    >
      {section.title && <PdfSectionTitle title={section.title} theme={theme} />}
      <View style={{ gap: theme.itemGapPt }}>
        {section.items.map((item, idx) => (
          <PdfItem
            key={`${section.id}-${idx}`}
            item={item}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
};
