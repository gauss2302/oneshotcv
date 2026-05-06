export const backendTemplatesWithPhotoSupport = [
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

interface BackendPhotoFrameConfig {
  width: number;
  height: number;
}

const BACKEND_TEMPLATE_PHOTO_CONFIG: Record<string, BackendPhotoFrameConfig> = {
  sidebar: {
    width: 200,
    height: 200,
  },
  modern: {
    width: 180,
    height: 180,
  },
  creative: {
    width: 250,
    height: 250,
  },
  designer: {
    width: 300,
    height: 300,
  },
  executive: {
    width: 200,
    height: 240,
  },
  tech: {
    width: 112,
    height: 112,
  },
  corporate: {
    width: 128,
    height: 128,
  },
  startup: {
    width: 128,
    height: 128,
  },
  compact: {
    width: 80,
    height: 80,
  },
};

export function backendTemplateSupportsPhoto(templateId: string): boolean {
  return backendTemplatesWithPhotoSupport.includes(templateId);
}

export function getBackendProcessingDimensions(templateId: string): {
  maxWidth: number;
  maxHeight: number;
} {
  const frameSize = BACKEND_TEMPLATE_PHOTO_CONFIG[templateId] ?? {
    width: 200,
    height: 200,
  };

  return {
    maxWidth: frameSize.width * 2,
    maxHeight: frameSize.height * 2,
  };
}
