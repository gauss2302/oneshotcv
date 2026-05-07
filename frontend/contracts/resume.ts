import { z } from "zod";

export const resumeIdSchema = z.string().uuid("Invalid resume ID format");

export const designFontSizesSchema = z.object({
  header: z.number().min(1).max(6),
  sectionTitle: z.number().min(0.75).max(4),
  body: z.number().min(0.5).max(2),
});

export const designSpacingSchema = z.object({
  lineHeight: z.number().min(1).max(3),
  sectionPadding: z.number().min(0).max(8),
  itemGap: z.number().min(0).max(4),
});

export const designSettingsSchema = z.object({
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  fontFamily: z.enum(["sans", "serif", "mono", "times"]),
  scale: z.number().min(0.5).max(2),
  textAlignment: z.enum(["left", "center", "right", "justify"]),
  fontSizes: designFontSizesSchema,
  spacing: designSpacingSchema,
});

export const photoDataSchema = z.object({
  id: resumeIdSchema,
  resumePhotoId: resumeIdSchema.optional(),
  url: z.string().url(),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().nonnegative(),
  mimeType: z.string().min(1).max(128),
  cropData: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number().positive(),
      height: z.number().positive(),
      zoom: z.number().positive().optional(),
    })
    .optional(),
});

export const personalInfoSchema = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email().max(255),
  phone: z.string().max(50),
  address: z.string().max(500),
  summary: z.string().max(2000),
  title: z.string().max(200),
  location: z.string().max(200).optional(),
  photo: photoDataSchema.optional(),
});

export const educationItemSchema = z.object({
  id: resumeIdSchema.optional(),
  institution: z.string().min(1).max(200),
  degree: z.string().max(200),
  startDate: z.string().max(50),
  endDate: z.string().max(50),
  description: z.string().max(2000),
  current: z.boolean().optional(),
});

export const experienceItemSchema = z.object({
  id: resumeIdSchema.optional(),
  company: z.string().min(1).max(200),
  position: z.string().min(1).max(200),
  startDate: z.string().max(50),
  endDate: z.string().max(50),
  location: z.string().max(200),
  description: z.string().max(5000),
  current: z.boolean().optional(),
  isCurrent: z.boolean().optional(),
});

export const skillItemSchema = z.object({
  id: resumeIdSchema.optional(),
  name: z.string().min(1).max(100),
  level: z.number().int().min(1).max(5),
});

export const resumeContentSchema = z.object({
  personalInfo: personalInfoSchema,
  education: z.array(educationItemSchema),
  experience: z.array(experienceItemSchema),
  skills: z.array(skillItemSchema),
  designSettings: designSettingsSchema,
  selectedTemplate: z.string().min(1).max(100).optional(),
});

export const resumeDocumentSchema = z.object({
  id: resumeIdSchema,
  title: z.string().min(1).max(200),
  content: resumeContentSchema,
});

export const emptyResumeDocumentSchema = z.object({
  content: z.null(),
});

export const resumeSummarySchema = z.object({
  id: resumeIdSchema,
  title: z.string().min(1).max(200),
  updatedAt: z.string().nullable(),
});

export const resumeListResponseSchema = z.object({
  resumes: z.array(resumeSummarySchema),
});

export const resumeGetResponseSchema = z.union([
  resumeDocumentSchema,
  emptyResumeDocumentSchema,
]);

export const saveResumeRequestSchema = z.object({
  id: resumeIdSchema.optional(),
  title: z.string().trim().min(1).max(200).optional(),
  createNew: z.boolean().optional(),
  content: resumeContentSchema,
});

export const saveResumeResponseSchema = z.object({
  success: z.literal(true),
  id: resumeIdSchema,
});

export const deleteResumeRequestSchema = z.object({
  id: resumeIdSchema,
});

export const deleteResumeResponseSchema = z.object({
  success: z.literal(true),
});

export type DesignSettings = z.infer<typeof designSettingsSchema>;
export type ResumeContent = z.infer<typeof resumeContentSchema>;
export type ResumeDocument = z.infer<typeof resumeDocumentSchema>;
export type ResumeSummary = z.infer<typeof resumeSummarySchema>;
export type SaveResumeRequest = z.infer<typeof saveResumeRequestSchema>;
