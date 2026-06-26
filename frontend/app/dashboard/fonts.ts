// BullseyeCV typography. Loaded here (not the root layout) so the three
// families are scoped to the redesigned dashboard subtree rather than
// preloaded site-wide. Apply the `.variable` class names on the dashboard root.
import { Spectral, Hanken_Grotesk, Spline_Sans_Mono } from "next/font/google";

export const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-spectral",
  display: "swap",
});

export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

export const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-spline-mono",
  display: "swap",
});

/** Combined variable classes — spread onto the dashboard root element. */
export const bullseyeFontVars = `${spectral.variable} ${hanken.variable} ${splineMono.variable}`;
