import { ApiError } from "@/lib/api-error";

export class PhotoNotFoundError extends ApiError {
  constructor() {
    super("Photo not found or access denied", 404);
  }
}

export class ResumePhotoNotFoundError extends ApiError {
  constructor() {
    super("Resume photo not found or access denied", 404);
  }
}

export class ResumeNotFoundForPhotoError extends ApiError {
  constructor() {
    super("Resume not found or access denied", 404);
  }
}

export class TemplateUnsupportedPhotoError extends ApiError {
  constructor() {
    super("This template does not support profile photos", 400);
  }
}

export class NoFileProvidedError extends ApiError {
  constructor() {
    super("No file provided", 400);
  }
}

export class InvalidFileTypeError extends ApiError {
  constructor() {
    super("Invalid file type. Only JPEG, PNG, and WebP are allowed.", 400);
  }
}

export class FileTooLargeError extends ApiError {
  constructor() {
    super("File too large. Maximum size is 10MB.", 400);
  }
}

export class FileTypeMismatchError extends ApiError {
  constructor() {
    super(
      "File type mismatch. The file content does not match the declared type.",
      400
    );
  }
}

export class ImageTooSmallError extends ApiError {
  constructor() {
    super("Image too small. Minimum dimensions are 200x200 pixels.", 400);
  }
}

export class InvalidCropDataError extends ApiError {
  constructor() {
    super("Crop area is outside the image bounds", 400);
  }
}

export class MaxPhotosReachedError extends ApiError {
  constructor(maxPhotos: number) {
    super(
      `Maximum ${maxPhotos} photos allowed. Please delete an existing photo first.`,
      400
    );
  }
}
