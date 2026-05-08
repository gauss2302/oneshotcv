import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { HeaderSpec, ThemeSpec, ContactSpec } from "../types";
import { fontSize, pdfFontFamily } from "../theme";
import { PdfIcon } from "./PdfIcons";

interface Props {
  header: HeaderSpec;
  theme: ThemeSpec;
}

const PHOTO_RADIUS = {
  circle: 999,
  rounded: 8,
  square: 0,
} as const;

/** Render a single contact item with optional icon. */
function PdfContact({
  contact,
  color,
  size,
}: {
  contact: ContactSpec;
  color: string;
  size: number;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      }}
      wrap={false}
    >
      {contact.icon && (
        <PdfIcon name={contact.icon} size={size + 1} color={color} />
      )}
      {contact.label && (
        <Text style={{ fontSize: size, color }}>{contact.label}</Text>
      )}
      <Text style={{ fontSize: size, color }}>{contact.value}</Text>
    </View>
  );
}

function ContactRow({
  contacts,
  color,
  size,
  align,
  separator,
}: {
  contacts: ContactSpec[];
  color: string;
  size: number;
  align: "flex-start" | "center" | "flex-end";
  separator?: string;
}) {
  if (separator) {
    // Render as a single inline string with bullets — useful for very compact
    // headers (Minimalist).
    const text = contacts
      .map((c) => `${c.label ? c.label + " " : ""}${c.value}`)
      .join(` ${separator} `);
    return (
      <Text
        style={{
          fontSize: size,
          color,
          textAlign:
            align === "center"
              ? "center"
              : align === "flex-end"
              ? "right"
              : "left",
        }}
      >
        {text}
      </Text>
    );
  }
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: align,
        rowGap: 4,
        columnGap: 14,
      }}
    >
      {contacts.map((c, i) => (
        <PdfContact key={i} contact={c} color={color} size={size} />
      ))}
    </View>
  );
}

function Photo({ photo }: { photo: HeaderSpec["photo"] }) {
  if (!photo) return null;
  // React-PDF's <Image> doesn't accept an `alt` prop; rule targets HTML.
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      src={photo.url}
      style={{
        width: photo.sizePt,
        height: photo.sizePt,
        borderRadius: PHOTO_RADIUS[photo.shape],
        borderWidth: photo.borderWidthPt ?? 0,
        borderColor: photo.borderColor ?? "transparent",
        objectFit: "cover",
      }}
    />
  );
}

export const PdfHeader: React.FC<Props> = ({ header, theme }) => {
  const fonts = pdfFontFamily(theme.fontFamily);

  switch (header.variant) {
    case "centered":
      return (
        <View style={{ marginBottom: 16, alignItems: "center" }}>
          {header.photo && (
            <View style={{ marginBottom: 8 }}>
              <Photo photo={header.photo} />
            </View>
          )}
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: fontSize(theme, 2.4),
              color: header.accentColor,
              letterSpacing: 0.4,
              textAlign: "center",
            }}
          >
            {header.fullName || "Your Name"}
          </Text>
          {header.title && (
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: fontSize(theme, 1.25),
                color: theme.mutedColor,
                marginTop: 2,
                textAlign: "center",
              }}
            >
              {header.title}
            </Text>
          )}
          {header.contacts.length > 0 && (
            <View style={{ marginTop: 8, alignSelf: "stretch" }}>
              <ContactRow
                contacts={header.contacts}
                color={theme.mutedColor}
                size={fontSize(theme, 0.9)}
                align="center"
              />
            </View>
          )}
        </View>
      );

    case "left-aligned":
      return (
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: fontSize(theme, 2.2),
              color: header.accentColor,
            }}
          >
            {header.fullName || "Your Name"}
          </Text>
          {header.title && (
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: fontSize(theme, 1.2),
                color: theme.mutedColor,
                marginTop: 2,
              }}
            >
              {header.title}
            </Text>
          )}
          {header.contacts.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <ContactRow
                contacts={header.contacts}
                color={theme.mutedColor}
                size={fontSize(theme, 0.9)}
                align="flex-start"
              />
            </View>
          )}
        </View>
      );

    case "split-with-photo":
      return (
        <View
          style={{
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          }}
        >
          {header.photo && <Photo photo={header.photo} />}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.bold,
                fontSize: fontSize(theme, 2.2),
                color: header.accentColor,
              }}
            >
              {header.fullName || "Your Name"}
            </Text>
            {header.title && (
              <Text
                style={{
                  fontFamily: fonts.regular,
                  fontSize: fontSize(theme, 1.2),
                  color: theme.mutedColor,
                  marginTop: 2,
                }}
              >
                {header.title}
              </Text>
            )}
            {header.contacts.length > 0 && (
              <View style={{ marginTop: 6 }}>
                <ContactRow
                  contacts={header.contacts}
                  color={theme.mutedColor}
                  size={fontSize(theme, 0.9)}
                  align="flex-start"
                />
              </View>
            )}
          </View>
        </View>
      );

    case "boxed":
      return (
        <View
          style={{
            marginBottom: 16,
            borderWidth: 2,
            borderColor: header.accentColor,
            padding: 14,
            alignItems: "center",
          }}
        >
          {header.photo && (
            <View style={{ marginBottom: 8 }}>
              <Photo photo={header.photo} />
            </View>
          )}
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: fontSize(theme, 2.4),
              color: theme.textColor,
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
                color: theme.mutedColor,
                marginTop: 4,
                textTransform: "uppercase",
                letterSpacing: 1.4,
              }}
            >
              {header.title}
            </Text>
          )}
          {header.contacts.length > 0 && (
            <View
              style={{
                marginTop: 10,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: header.accentColor,
                alignSelf: "stretch",
              }}
            >
              <ContactRow
                contacts={header.contacts}
                color={theme.mutedColor}
                size={fontSize(theme, 0.9)}
                align="center"
              />
            </View>
          )}
        </View>
      );

    case "banner":
      return (
        <View
          style={{
            marginBottom: 14,
            backgroundColor: header.backgroundColor ?? header.accentColor,
            padding: 18,
            alignItems: "center",
          }}
        >
          {header.photo && (
            <View style={{ marginBottom: 8 }}>
              <Photo photo={header.photo} />
            </View>
          )}
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: fontSize(theme, 2.6),
              color: header.textColor ?? "#ffffff",
              letterSpacing: 0.4,
              textAlign: "center",
            }}
          >
            {header.fullName || "Your Name"}
          </Text>
          {header.title && (
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: fontSize(theme, 1.15),
                color: header.textColor ?? "#ffffff",
                marginTop: 4,
                opacity: 0.9,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              {header.title}
            </Text>
          )}
          {header.contacts.length > 0 && (
            <View style={{ marginTop: 10, alignSelf: "stretch" }}>
              <ContactRow
                contacts={header.contacts}
                color={header.textColor ?? "#ffffff"}
                size={fontSize(theme, 0.9)}
                align="center"
              />
            </View>
          )}
        </View>
      );

    case "underlined":
    default:
      return (
        <View
          style={{
            marginBottom: 16,
            borderBottomWidth: 4,
            borderBottomColor: header.accentColor,
            paddingBottom: 12,
            flexDirection: header.photo ? "row" : "column",
            gap: 14,
            alignItems: header.photo ? "center" : "flex-start",
          }}
        >
          {header.photo && <Photo photo={header.photo} />}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.bold,
                fontSize: fontSize(theme, 2.4),
                color: header.accentColor,
              }}
            >
              {header.fullName || "Your Name"}
            </Text>
            {header.title && (
              <Text
                style={{
                  fontFamily: fonts.regular,
                  fontSize: fontSize(theme, 1.2),
                  color: theme.mutedColor,
                  marginTop: 4,
                }}
              >
                {header.title}
              </Text>
            )}
            {header.contacts.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <ContactRow
                  contacts={header.contacts}
                  color={theme.mutedColor}
                  size={fontSize(theme, 0.9)}
                  align="flex-start"
                />
              </View>
            )}
          </View>
        </View>
      );
  }
};
