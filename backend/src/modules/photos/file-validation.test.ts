import { describe, expect, it } from "vitest";

import {
  getBackendMimeTypeFromMagic,
  validateBackendFileType,
} from "./file-validation";

describe("photo file validation", () => {
  it("detects PNG files by magic number", () => {
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d,
    ]);

    expect(getBackendMimeTypeFromMagic(pngBuffer)).toBe("image/png");
    expect(validateBackendFileType(pngBuffer, "image/png")).toBe(true);
  });

  it("rejects mismatched file types", () => {
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d,
    ]);

    expect(validateBackendFileType(pngBuffer, "image/jpeg")).toBe(false);
  });
});
