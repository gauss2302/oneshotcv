/**
 * Zod validation schemas for API input validation
 */

import { z } from "zod";

// Resume validation schemas
export const resumeIdSchema = z.string().uuid("Invalid resume ID format");

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(200, "Full name too long"),
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  phone: z.string().max(50, "Phone number too long").optional(),
  address: z.string().max(500, "Address too long").optional(),
  title: z.string().max(200, "Title too long").optional(),
  summary: z.string().max(2000, "Summary too long").optional(),
});

export const educationSchema = z.object({
  id: z.string().uuid().optional(),
  institution: z.string().min(1, "Institution is required").max(200, "Institution name too long"),
  degree: z.string().max(200, "Degree too long").optional(),
  startDate: z.string().max(50, "Start date too long").optional(),
  endDate: z.string().max(50, "End date too long").optional(),
  description: z.string().max(2000, "Description too long").optional(),
});

export const experienceSchema = z.object({
  id: z.string().uuid().optional(),
  company: z.string().min(1, "Company is required").max(200, "Company name too long"),
  position: z.string().min(1, "Position is required").max(200, "Position too long"),
  startDate: z.string().max(50, "Start date too long").optional(),
  endDate: z.string().max(50, "End date too long").optional(),
  location: z.string().max(200, "Location too long").optional(),
  description: z.string().max(5000, "Description too long").optional(),
  isCurrent: z.boolean().optional(),
});

export const skillSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Skill name is required").max(100, "Skill name too long"),
  level: z.number().min(0).max(100).optional(),
});

export const designSettingsSchema = z.object({
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
  fontFamily: z.string().max(100, "Font family too long").optional(),
  fontSizeHeader: z.number().min(8).max(72).optional(),
  fontSizeSectionTitle: z.number().min(8).max(48).optional(),
  fontSizeBody: z.number().min(8).max(24).optional(),
  scale: z.number().min(0.5).max(2.0).optional(),
  lineHeight: z.number().min(1.0).max(3.0).optional(),
  sectionPadding: z.number().min(0).max(100).optional(),
  itemGap: z.number().min(0).max(50).optional(),
  textAlignment: z.enum(["left", "center", "right", "justify"]).optional(),
});

export const resumeContentSchema = z.object({
  personalInfo: personalInfoSchema,
  selectedTemplate: z.string().max(100, "Template name too long").optional(),
  designSettings: designSettingsSchema.optional(),
  education: z.array(educationSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  skills: z.array(skillSchema).optional(),
});

export const resumeSaveSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: resumeContentSchema,
});

// Photo validation schemas
export const photoIdSchema = z.string().uuid("Invalid photo ID format");

export const cropDataSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().min(1),
  height: z.number().min(1),
  zoom: z.number().min(0).max(10).optional(),
});

// Helper function to sanitize strings (XSS prevention)
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim();
}

// Helper function to sanitize object recursively
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeString(sanitized[key] as string) as T[typeof key];
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key] as Record<string, unknown>) as T[typeof key];
    }
  }
  return sanitized;
}
