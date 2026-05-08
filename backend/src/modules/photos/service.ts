import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import type {
  AttachPhotoRequest,
  DetachPhotoRequest,
  LibraryPhoto,
  RecropPhotoRequest,
} from "@/contracts/photo";

import {
  getBackendPublicFileUrl,
  getFromBackendMinio,
  processBackendImage,
  deleteFromBackendMinio,
  uploadToBackendMinio,
  validateBackendImageDimensions,
} from "@/infrastructure/storage/minio";
import { db } from "@/infrastructure/db/client";
import { photos, resumePhotos } from "@/infrastructure/db/schema";

import {
  FileTooLargeError,
  FileTypeMismatchError,
  ImageTooSmallError,
  InvalidFileTypeError,
  MaxPhotosReachedError,
  PhotoNotFoundError,
  ResumeNotFoundForPhotoError,
  ResumePhotoNotFoundError,
  TemplateUnsupportedPhotoError,
} from "./errors";
import {
  getBackendMimeTypeFromMagic,
  sanitizeBackendFileName,
  validateBackendFileSize,
  validateBackendFileType,
} from "./file-validation";
import {
  backendTemplateSupportsPhoto,
  getBackendProcessingDimensions,
} from "./template-config";
import { photoRepository } from "./repository";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_PHOTOS_PER_USER = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function normalizeMimeType(mimeType: string): string {
  return mimeType === "image/jpg" ? "image/jpeg" : mimeType;
}

function requirePublicUrl(path: string): string {
  const publicUrl = getBackendPublicFileUrl(path);
  if (!publicUrl) {
    throw new Error("Public storage URL is not configured");
  }

  return publicUrl;
}

export const photoService = {
  async uploadPhoto(userId: string, file: {
    filename: string;
    mimetype: string;
    toBuffer: () => Promise<Buffer>;
  }) {
    const [photoCount] = await photoRepository.countUserPhotos(userId);
    if (photoCount.count >= MAX_PHOTOS_PER_USER) {
      throw new MaxPhotosReachedError(MAX_PHOTOS_PER_USER);
    }

    const declaredMimeType = normalizeMimeType(file.mimetype);

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new InvalidFileTypeError();
    }

    const buffer = await file.toBuffer();
    if (!validateBackendFileSize(buffer.length, MAX_FILE_SIZE)) {
      throw new FileTooLargeError();
    }

    const actualMimeType = getBackendMimeTypeFromMagic(buffer);
    if (!actualMimeType || !validateBackendFileType(buffer, declaredMimeType)) {
      throw new FileTypeMismatchError();
    }

    const { width, height, isValid } = await validateBackendImageDimensions(buffer);
    if (!isValid) {
      throw new ImageTooSmallError();
    }

    const sanitizedFileName = sanitizeBackendFileName(file.filename);
    const photoId = uuidv4();
    const extension = actualMimeType.split("/")[1];
    const originalPath = `originals/${userId}/${photoId}.${extension}`;

    await uploadToBackendMinio(buffer, originalPath, actualMimeType);

    const [newPhoto] = await db
      .insert(photos)
      .values({
        id: photoId,
        userId,
        originalPath,
        fileName: sanitizedFileName,
        fileSize: buffer.length,
        mimeType: actualMimeType,
        width,
        height,
        isActive: true,
      })
      .returning();

    return {
      id: newPhoto.id,
      fileName: newPhoto.fileName,
      fileSize: newPhoto.fileSize,
      width: newPhoto.width,
      height: newPhoto.height,
    };
  },

  async listPhotos(userId: string): Promise<LibraryPhoto[]> {
    const userPhotos = await photoRepository.listUserPhotos(userId);

    return userPhotos.map((photo) => ({
      id: photo.id,
      fileName: photo.fileName,
      fileSize: photo.fileSize,
      width: photo.width,
      height: photo.height,
      originalUrl: requirePublicUrl(photo.originalPath),
      createdAt: photo.createdAt.toISOString(),
    }));
  },

  async attachPhoto(userId: string, payload: AttachPhotoRequest) {
    if (!backendTemplateSupportsPhoto(payload.templateId)) {
      throw new TemplateUnsupportedPhotoError();
    }

    const photo = await photoRepository.findUserPhoto(userId, payload.photoId);
    if (!photo) {
      throw new PhotoNotFoundError();
    }

    const resumeRecord = await photoRepository.findUserResume(userId, payload.resumeId);
    if (!resumeRecord) {
      throw new ResumeNotFoundForPhotoError();
    }

    const existingResumePhoto = await photoRepository.findResumePhotoByResume(payload.resumeId);
    if (existingResumePhoto) {
      await deleteFromBackendMinio(existingResumePhoto.processedPath).catch(() => undefined);
      await db.delete(resumePhotos).where(eq(resumePhotos.resumeId, payload.resumeId));
    }

    const originalBuffer = await getFromBackendMinio(photo.originalPath);
    const { maxWidth, maxHeight } = getBackendProcessingDimensions(payload.templateId);

    const processedResult = await processBackendImage(
      originalBuffer,
      `processed/${userId}/${payload.photoId}_${payload.resumeId}`,
      {
        maxWidth,
        maxHeight,
        quality: 85,
        crop: payload.cropData,
      }
    );

    const [newResumePhoto] = await db
      .insert(resumePhotos)
      .values({
        id: uuidv4(),
        resumeId: payload.resumeId,
        photoId: payload.photoId,
        processedPath: processedResult.path,
        cropData: JSON.stringify(payload.cropData),
      })
      .returning();

    return {
      id: newResumePhoto.id,
      photoId: newResumePhoto.photoId,
      url: requirePublicUrl(processedResult.path),
      cropData: payload.cropData,
    };
  },

  async recropPhoto(userId: string, payload: RecropPhotoRequest) {
    const [resumePhotoRecord] = await photoRepository.findResumePhotoWithPhoto(
      userId,
      payload.resumePhotoId
    );

    if (!resumePhotoRecord) {
      throw new ResumePhotoNotFoundError();
    }

    await deleteFromBackendMinio(resumePhotoRecord.resumePhoto.processedPath).catch(() => undefined);

    const originalBuffer = await getFromBackendMinio(resumePhotoRecord.photo.originalPath);
    const { maxWidth, maxHeight } = getBackendProcessingDimensions(payload.templateId);

    const processedResult = await processBackendImage(
      originalBuffer,
      `processed/${userId}/${resumePhotoRecord.photo.id}_${resumePhotoRecord.resume.id}`,
      {
        maxWidth,
        maxHeight,
        quality: 85,
        crop: payload.cropData,
      }
    );

    await db
      .update(resumePhotos)
      .set({
        processedPath: processedResult.path,
        cropData: JSON.stringify(payload.cropData),
        updatedAt: new Date(),
      })
      .where(eq(resumePhotos.id, payload.resumePhotoId));

    return {
      url: requirePublicUrl(processedResult.path),
      cropData: payload.cropData,
    };
  },

  async detachPhoto(userId: string, payload: DetachPhotoRequest) {
    const [resumePhotoRecord] = await photoRepository.findResumePhotoForUser(userId, payload);

    if (!resumePhotoRecord) {
      throw new ResumePhotoNotFoundError();
    }

    await deleteFromBackendMinio(resumePhotoRecord.resumePhoto.processedPath).catch(() => undefined);
    await db.delete(resumePhotos).where(eq(resumePhotos.id, resumePhotoRecord.resumePhoto.id));
  },

  async deletePhoto(userId: string, photoId: string, force: boolean) {
    const photo = await photoRepository.findUserPhoto(userId, photoId);
    if (!photo) {
      throw new PhotoNotFoundError();
    }

    const usages = await photoRepository.listPhotoUsages(photoId);
    if (usages.length > 0 && !force) {
      return {
        conflict: true as const,
        usageCount: usages.length,
      };
    }

    if (usages.length > 0) {
      for (const usage of usages) {
        await deleteFromBackendMinio(usage.processedPath).catch(() => undefined);
      }

      await db.delete(resumePhotos).where(eq(resumePhotos.photoId, photoId));
    }

    await deleteFromBackendMinio(photo.originalPath).catch(() => undefined);
    await db.delete(photos).where(eq(photos.id, photoId));

    return {
      conflict: false as const,
    };
  },
};
