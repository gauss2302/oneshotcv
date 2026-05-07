import { z } from "zod";

import { resumeIdSchema } from "./resume";

export const photoIdSchema = z.string().uuid("Invalid photo ID format");

export const cropDataSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  zoom: z.number().positive().optional(),
});

export const uploadedPhotoSchema = z.object({
  id: photoIdSchema,
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().nonnegative(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const photoUploadResponseSchema = z.object({
  success: z.literal(true),
  photo: uploadedPhotoSchema,
});

export const libraryPhotoSchema = z.object({
  id: photoIdSchema,
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().nonnegative(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  originalUrl: z.string().url(),
  createdAt: z.string(),
});

export const photoLibraryResponseSchema = z.object({
  success: z.literal(true),
  photos: z.array(libraryPhotoSchema),
});

export const attachPhotoRequestSchema = z.object({
  photoId: photoIdSchema,
  resumeId: resumeIdSchema,
  cropData: cropDataSchema,
  templateId: z.string().min(1).max(100),
});

export const attachPhotoResponseSchema = z.object({
  success: z.literal(true),
  resumePhoto: z.object({
    id: resumeIdSchema,
    photoId: photoIdSchema,
    url: z.string().url(),
    cropData: cropDataSchema,
  }),
});

export const recropPhotoRequestSchema = z.object({
  resumePhotoId: resumeIdSchema,
  cropData: cropDataSchema,
  templateId: z.string().min(1).max(100),
});

export const recropPhotoResponseSchema = z.object({
  success: z.literal(true),
  url: z.string().url(),
  cropData: cropDataSchema,
});

export const detachPhotoRequestSchema = z.object({
  resumeId: resumeIdSchema.optional(),
  resumePhotoId: resumeIdSchema.optional(),
  photoId: photoIdSchema.optional(),
});

export const messageResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().min(1),
});

export const deletePhotoConflictResponseSchema = z.object({
  error: z.literal("Photo is in use"),
  inUse: z.literal(true),
  usageCount: z.number().int().nonnegative(),
  message: z.string().min(1),
});

export type LibraryPhoto = z.infer<typeof libraryPhotoSchema>;
export type AttachPhotoRequest = z.infer<typeof attachPhotoRequestSchema>;
export type DetachPhotoRequest = z.infer<typeof detachPhotoRequestSchema>;
export type RecropPhotoRequest = z.infer<typeof recropPhotoRequestSchema>;
