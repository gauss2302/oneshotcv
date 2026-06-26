import type { CSSProperties } from "react";

/**
 * The BullseyeCV mark — concentric rings narrowing to a single center.
 * A multi-stop radial-gradient is the one thing Tailwind can't express
 * cleanly, so this small component is the deliberate inline-style exception.
 */
export function Bullseye({
  size = 32,
  ring = "#DB4B2E",
  gap = "#FCFAF6",
  className = "",
  style,
}: {
  size?: number;
  ring?: string;
  gap?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={className}
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        borderRadius: "9999px",
        display: "inline-block",
        background: `radial-gradient(circle, ${ring} 0 17%, ${gap} 17% 36%, ${ring} 36% 55%, ${gap} 55% 74%, ${ring} 74% 100%)`,
        ...style,
      }}
    />
  );
}
