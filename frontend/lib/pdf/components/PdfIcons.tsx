/**
 * Tiny set of SVG icons used inside the PDF.
 *
 * React-PDF supports `<Svg>` + `<Path>` etc. natively, so we draw icons as
 * vector paths rather than relying on lucide-react (which renders DOM SVG).
 *
 * All icons are designed on a 24×24 viewBox so callers can size them via the
 * `size` prop in points.
 */

import React from "react";
import { Svg, Path } from "@react-pdf/renderer";
import { IconKey } from "../types";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  name: IconKey;
}

interface PathDef {
  d: string;
  /** Default is none (stroke-only icon). Set true to fill the path. */
  fill?: boolean;
}

const ICON_PATHS: Record<IconKey, PathDef[]> = {
  mail: [
    {
      d: "M4 4h16c1.1 0 2 0.9 2 2v12c0 1.1-0.9 2-2 2H4c-1.1 0-2-0.9-2-2V6c0-1.1 0.9-2 2-2z",
    },
    { d: "M22 6l-10 7L2 6" },
  ],
  phone: [
    {
      d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 0.7 2.81 2 2 0 0 1-0.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-0.45 12.84 12.84 0 0 0 2.81 0.7A2 2 0 0 1 22 16.92z",
    },
  ],
  "map-pin": [
    { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" },
    { d: "M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" },
  ],
  globe: [
    { d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" },
    { d: "M2 12h20" },
    { d: "M12 2c2.5 3 4 7 4 10s-1.5 7-4 10c-2.5-3-4-7-4-10s1.5-7 4-10z" },
  ],
  linkedin: [
    {
      d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 1 0-4 0v7h-4v-7a6 6 0 0 1 6-6z",
    },
    { d: "M2 9h4v12H2z" },
    { d: "M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
  ],
  github: [
    {
      d: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-0.94-2.61c3.14-0.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77a5.07 5.07 0 0 0-0.09-3.77S18.73 0.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27 0.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
    },
  ],
  "graduation-cap": [
    { d: "M22 10v6M2 10l10-5 10 5-10 5z" },
    { d: "M6 12v5a8 8 0 0 0 12 0v-5" },
  ],
  briefcase: [
    { d: "M2 7h20v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" },
    { d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" },
  ],
  code: [
    { d: "M16 18l6-6-6-6" },
    { d: "M8 6l-6 6 6 6" },
  ],
  rocket: [
    {
      d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",
    },
  ],
  award: [
    { d: "M12 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" },
    { d: "M8.21 13.89L7 23l5-3 5 3-1.21-9.12" },
  ],
  calendar: [
    { d: "M3 4h18v18H3z" },
    { d: "M16 2v4M8 2v4M3 10h18" },
  ],
};

export const PdfIcon: React.FC<IconProps> = ({
  name,
  size = 10,
  color = "#374151",
  strokeWidth = 2,
}) => {
  const paths = ICON_PATHS[name];
  if (!paths) return null;
  return (
    <Svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ width: size, height: size }}
    >
      {paths.map((p, i) => (
        <Path
          key={i}
          d={p.d}
          stroke={color}
          strokeWidth={strokeWidth}
          fill={p.fill ? color : "none"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
};
