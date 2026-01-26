/**
 * File validation utilities for security
 * Includes magic number checking to verify actual file types
 */

// Magic numbers (file signatures) for allowed image types
const MAGIC_NUMBERS: Record<string, number[][]> = {
  "image/jpeg": [
    [0xff, 0xd8, 0xff], // JPEG
  ],
  "image/png": [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
  ],
  "image/webp": [
    [0x52, 0x49, 0x46, 0x46], // WebP (RIFF header, need to check further)
  ],
};

/**
 * Validates file type by checking magic numbers (file signatures)
 * This prevents file type spoofing by checking actual file content
 */
export function validateFileType(buffer: Buffer, declaredMimeType: string): boolean {
  if (!MAGIC_NUMBERS[declaredMimeType]) {
    return false;
  }

  const signatures = MAGIC_NUMBERS[declaredMimeType];

  for (const signature of signatures) {
    if (buffer.length < signature.length) {
      continue;
    }

    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      // For WebP, we need to check further (bytes 8-11 should be "WEBP")
      if (declaredMimeType === "image/webp" && buffer.length >= 12) {
        const webpSignature = Buffer.from("WEBP");
        const webpHeader = buffer.slice(8, 12);
        return webpHeader.equals(webpSignature);
      }
      return true;
    }
  }

  return false;
}

/**
 * Sanitizes a filename to prevent directory traversal and other attacks
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path components
  const sanitized = fileName
    .replace(/^.*[\\/]/, "") // Remove path
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace invalid chars
    .substring(0, 255); // Limit length

  // Ensure it's not empty and doesn't start with a dot
  if (!sanitized || sanitized.startsWith(".")) {
    return `file_${Date.now()}`;
  }

  return sanitized;
}

/**
 * Validates file size
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Gets the actual MIME type from magic numbers
 */
export function getMimeTypeFromMagic(buffer: Buffer): string | null {
  if (buffer.length < 4) {
    return null;
  }

  // Check JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // Check PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // Check WebP (RIFF...WEBP)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}
