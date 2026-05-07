const MAGIC_NUMBERS: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

export function validateBackendFileType(
  buffer: Buffer,
  declaredMimeType: string
): boolean {
  const signatures = MAGIC_NUMBERS[declaredMimeType];
  if (!signatures) {
    return false;
  }

  for (const signature of signatures) {
    if (buffer.length < signature.length) {
      continue;
    }

    let matches = true;
    for (let index = 0; index < signature.length; index += 1) {
      if (buffer[index] !== signature[index]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      if (declaredMimeType === "image/webp" && buffer.length >= 12) {
        return buffer.slice(8, 12).equals(Buffer.from("WEBP"));
      }

      return true;
    }
  }

  return false;
}

export function sanitizeBackendFileName(fileName: string): string {
  const sanitized = fileName
    .replace(/^.*[\\/]/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .substring(0, 255);

  if (!sanitized || sanitized.startsWith(".")) {
    return `file_${Date.now()}`;
  }

  return sanitized;
}

export function validateBackendFileSize(
  size: number,
  maxSize: number
): boolean {
  return size > 0 && size <= maxSize;
}

export function getBackendMimeTypeFromMagic(buffer: Buffer): string | null {
  if (buffer.length < 4) {
    return null;
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

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
