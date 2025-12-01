import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== AUTH TABLES (Better Auth) ====================
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { mode: "date" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== RESUMES (Main table) ====================
export const resumes = pgTable("resumes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Personal Info
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  professionalTitle: text("professional_title"),

  // Resume metadata
  title: text("title"),
  summary: text("summary"),
  selectedTemplate: text("selected_template").notNull(),

  // Design settings
  themeColor: text("theme_color").notNull(),
  fontFamily: text("font_family").notNull(),
  fontSizeHeader: numeric("font_size_header").notNull(),
  fontSizeSectionTitle: numeric("font_size_section_title").notNull(),
  fontSizeBody: numeric("font_size_body").notNull(),
  scale: numeric("scale").notNull(),
  lineHeight: numeric("line_height").notNull(),
  sectionPadding: numeric("section_padding").notNull(),
  itemGap: numeric("item_gap").notNull(),
  textAlignment: text("text_alignment").notNull(),

  version: integer("version").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ==================== EDUCATION ====================
export const education = pgTable("education", {
  id: uuid("id").defaultRandom().primaryKey(),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  institution: text("institution").notNull(),
  degree: text("degree"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  description: text("description"),
});

// ==================== EXPERIENCE ====================
export const experience = pgTable("experience", {
  id: uuid("id").defaultRandom().primaryKey(),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  position: text("position").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  location: text("location"),
  description: text("description"),
  isCurrent: boolean("is_current").default(false).notNull(),
  sortOrder: integer("sort_order"),
});

// ==================== SKILLS ====================
export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  level: integer("level").notNull(),
  sortOrder: integer("sort_order"),
});

// ==================== PHOTOS (User photo library) ====================
export const photos = pgTable("photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  originalPath: text("original_path").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ==================== RESUME_PHOTOS (Join table) ====================
export const resumePhotos = pgTable("resume_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" })
    .unique(),
  photoId: uuid("photo_id")
    .notNull()
    .references(() => photos.id, { onDelete: "cascade" }),
  processedPath: text("processed_path").notNull(),
  cropData: text("crop_data"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ==================== RELATIONS ====================
export const userRelations = relations(user, ({ many }) => ({
  resumes: many(resumes),
  photos: many(photos),
}));

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  user: one(user, {
    fields: [resumes.userId],
    references: [user.id],
  }),
  education: many(education),
  experience: many(experience),
  skills: many(skills),
  resumePhoto: one(resumePhotos, {
    fields: [resumes.id],
    references: [resumePhotos.resumeId],
  }),
}));

export const educationRelations = relations(education, ({ one }) => ({
  resume: one(resumes, {
    fields: [education.resumeId],
    references: [resumes.id],
  }),
}));

export const experienceRelations = relations(experience, ({ one }) => ({
  resume: one(resumes, {
    fields: [experience.resumeId],
    references: [resumes.id],
  }),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  resume: one(resumes, {
    fields: [skills.resumeId],
    references: [resumes.id],
  }),
}));

export const photosRelations = relations(photos, ({ one, many }) => ({
  user: one(user, {
    fields: [photos.userId],
    references: [user.id],
  }),
  resumePhotos: many(resumePhotos),
}));

export const resumePhotosRelations = relations(resumePhotos, ({ one }) => ({
  resume: one(resumes, {
    fields: [resumePhotos.resumeId],
    references: [resumes.id],
  }),
  photo: one(photos, {
    fields: [resumePhotos.photoId],
    references: [photos.id],
  }),
}));
