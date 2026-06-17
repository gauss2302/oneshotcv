import { v4 as uuidv4 } from "uuid";
import { and, eq, sql } from "drizzle-orm";
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
import { photos, resumePhotos, resumes } from "@/infrastructure/db/schema";

import {
  FileTooLargeError,
  FileTypeMismatchError,
  ImageTooSmallError,
  InvalidCropDataError,
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
  validateBackendCropBounds,
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

async function lockResumePhotoSlot(
  tx: Parameters<typeof db.transaction>[0] extends (arg: infer T) => unknown ? T : never,
  resumeId: string
): Promise<void> {
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${resumeId})::bigint)`);
}

async function deleteStoredObject(path: string | null | undefined): Promise<void> {
  if (!path) {
    return;
  }

  await deleteFromBackendMinio(path).catch(() => undefined);
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

    let newPhoto: typeof photos.$inferSelect;
    try {
      [newPhoto] = await db
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
    } catch (error) {
      await deleteStoredObject(originalPath);
      throw error;
    }

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
    if (!validateBackendCropBounds(payload.cropData, photo)) {
      throw new InvalidCropDataError();
    }

    const resumeRecord = await photoRepository.findUserResume(userId, payload.resumeId);
    if (!resumeRecord) {
      throw new ResumeNotFoundForPhotoError();
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

    let oldProcessedPath: string | null = null;
    let newResumePhoto: typeof resumePhotos.$inferSelect;

    try {
      newResumePhoto = await db.transaction(async (tx) => {
        await lockResumePhotoSlot(tx, payload.resumeId);

        const [existingResumePhoto] = await tx
          .select()
          .from(resumePhotos)
          .where(eq(resumePhotos.resumeId, payload.resumeId))
          .limit(1);

        if (existingResumePhoto) {
          oldProcessedPath = existingResumePhoto.processedPath;
          await tx
            .delete(resumePhotos)
            .where(eq(resumePhotos.id, existingResumePhoto.id));
        }

        const [insertedResumePhoto] = await tx
          .insert(resumePhotos)
          .values({
            id: uuidv4(),
            resumeId: payload.resumeId,
            photoId: payload.photoId,
            processedPath: processedResult.path,
            cropData: JSON.stringify(payload.cropData),
          })
          .returning();

        return insertedResumePhoto;
      });
    } catch (error) {
      await deleteStoredObject(processedResult.path);
      throw error;
    }

    await deleteStoredObject(oldProcessedPath);

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
    if (!validateBackendCropBounds(payload.cropData, resumePhotoRecord.photo)) {
      throw new InvalidCropDataError();
    }

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

    let oldProcessedPath: string | null = null;
    try {
      await db.transaction(async (tx) => {
        await lockResumePhotoSlot(tx, resumePhotoRecord.resume.id);

        const [currentResumePhoto] = await tx
          .select({
            id: resumePhotos.id,
            processedPath: resumePhotos.processedPath,
          })
          .from(resumePhotos)
          .innerJoin(resumes, eq(resumePhotos.resumeId, resumes.id))
          .where(
            and(
              eq(resumePhotos.id, payload.resumePhotoId),
              eq(resumes.userId, userId)
            )
          )
          .limit(1);

        if (!currentResumePhoto) {
          throw new ResumePhotoNotFoundError();
        }

        oldProcessedPath = currentResumePhoto.processedPath;

        await tx
          .update(resumePhotos)
          .set({
            processedPath: processedResult.path,
            cropData: JSON.stringify(payload.cropData),
            updatedAt: new Date(),
          })
          .where(eq(resumePhotos.id, currentResumePhoto.id));
      });
    } catch (error) {
      await deleteStoredObject(processedResult.path);
      throw error;
    }

    await deleteStoredObject(oldProcessedPath);

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

    await db
      .delete(resumePhotos)
      .where(eq(resumePhotos.id, resumePhotoRecord.resumePhoto.id));
    await deleteStoredObject(resumePhotoRecord.resumePhoto.processedPath);
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

    await db.transaction(async (tx) => {
      if (usages.length > 0) {
        await tx.delete(resumePhotos).where(eq(resumePhotos.photoId, photoId));
      }

      await tx
        .delete(photos)
        .where(and(eq(photos.id, photoId), eq(photos.userId, userId)));
    });

    for (const usage of usages) {
      await deleteStoredObject(usage.processedPath);
    }
    await deleteStoredObject(photo.originalPath);

    return {
      conflict: false as const,
    };
  },
};
