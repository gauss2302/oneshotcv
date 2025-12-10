// Template photo support configuration

export const TEMPLATES_WITH_PHOTO_SUPPORT = [
  "sidebar",
  "modern",
  "creative",
  "designer",
  "executive",
  "tech",
  "corporate",
  "startup",
  "compact",
];

export interface PhotoFrameConfig {
  width: number;
  height: number;
  aspectRatio: number;
}

const TEMPLATE_PHOTO_CONFIG: Record<string, PhotoFrameConfig> = {
  sidebar: {
    width: 200,
    height: 200,
    aspectRatio: 1, // 1:1 square
  },
  modern: {
    width: 180,
    height: 180,
    aspectRatio: 1, // 1:1 square
  },
  creative: {
    width: 250,
    height: 250,
    aspectRatio: 1, // 1:1 square
  },
  designer: {
    width: 300,
    height: 300,
    aspectRatio: 1, // 1:1 square
  },
  executive: {
    width: 200,
    height: 240,
    aspectRatio: 200 / 240, // 5:6 portrait (approximately 0.83)
  },
  tech: {
    width: 112,
    height: 112,
    aspectRatio: 1, // 1:1 square
  },
  corporate: {
    width: 128,
    height: 128,
    aspectRatio: 1, // 1:1 square
  },
  startup: {
    width: 128,
    height: 128,
    aspectRatio: 1, // 1:1 square
  },
  compact: {
    width: 80,
    height: 80,
    aspectRatio: 1, // 1:1 square
  },
};

/**
 * Check if a template supports profile photos
 */
export function templateSupportsPhoto(templateId: string): boolean {
  return TEMPLATES_WITH_PHOTO_SUPPORT.includes(templateId);
}

/**
 * Get the aspect ratio for the crop editor for a specific template
 * Returns a number where 1 = square, <1 = portrait, >1 = landscape
 */
export function getPhotoAspectRatio(templateId: string): number {
  const config = TEMPLATE_PHOTO_CONFIG[templateId];
  return config ? config.aspectRatio : 1; // Default to square
}

/**
 * Get the frame size (display dimensions) for a template
 * Returns dimensions in pixels for rendering in the template
 */
export function getPhotoFrameSize(templateId: string): {
  width: number;
  height: number;
} {
  const config = TEMPLATE_PHOTO_CONFIG[templateId];
  return config
    ? { width: config.width, height: config.height }
    : { width: 200, height: 200 }; // Default size
}

/**
 * Get the maximum dimensions for processing images for a specific template
 * This is used when cropping/processing images on the server
 */
export function getProcessingDimensions(templateId: string): {
  maxWidth: number;
  maxHeight: number;
} {
  const frameSize = getPhotoFrameSize(templateId);
  // Process at 2x resolution for better quality on high-DPI screens
  return {
    maxWidth: frameSize.width * 2,
    maxHeight: frameSize.height * 2,
  };
}
