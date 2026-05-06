import type {
  ResumeContent,
  ResumeDocument,
  ResumeSummary,
  SaveResumeRequest,
} from "@contracts/resume";

import { getBackendPublicFileUrl } from "@/infrastructure/storage/minio";
import {
  education,
  experience,
  photos,
  resumePhotos,
  resumes,
  skills,
} from "@/infrastructure/db/schema";

type ResumeRecord = typeof resumes.$inferSelect & {
  education?: (typeof education.$inferSelect)[];
  experience?: (typeof experience.$inferSelect)[];
  skills?: (typeof skills.$inferSelect)[];
  resumePhoto?:
    | (typeof resumePhotos.$inferSelect & {
        photo?: typeof photos.$inferSelect;
      })
    | null;
};

const DEFAULT_TITLE = "Untitled Resume";

const DEFAULT_DESIGN_SETTINGS: ResumeContent["designSettings"] = {
  themeColor: "#3b82f6",
  fontFamily: "sans",
  scale: 1,
  textAlignment: "left",
  fontSizes: {
    header: 2.25,
    sectionTitle: 1.5,
    body: 1,
  },
  spacing: {
    lineHeight: 1.6,
    sectionPadding: 2,
    itemGap: 1,
  },
};

export function mapResumeRecordToDocument(resume: ResumeRecord): ResumeDocument {
  const resumePhoto = resume.resumePhoto?.photo;

  return {
    id: resume.id,
    title: resume.title ?? DEFAULT_TITLE,
    content: {
      personalInfo: {
        fullName: resume.fullName,
        email: resume.email,
        phone: resume.phone ?? "",
        address: resume.address ?? "",
        summary: resume.summary ?? "",
        title: resume.professionalTitle ?? "",
        location: "",
        photo:
          resume.resumePhoto && resumePhoto
            ? {
                id: resumePhoto.id,
                resumePhotoId: resume.resumePhoto.id,
                url: getBackendPublicFileUrl(resume.resumePhoto.processedPath) ?? "",
                fileName: resumePhoto.fileName,
                fileSize: resumePhoto.fileSize,
                mimeType: resumePhoto.mimeType,
                cropData: resume.resumePhoto.cropData
                  ? JSON.parse(resume.resumePhoto.cropData)
                  : undefined,
              }
            : undefined,
      },
      education:
        resume.education?.map((item) => ({
          id: item.id,
          institution: item.institution,
          degree: item.degree ?? "",
          startDate: item.startDate ?? "",
          endDate: item.endDate ?? "",
          description: item.description ?? "",
          current: false,
        })) ?? [],
      experience:
        [...(resume.experience ?? [])]
          .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
          .map((item) => ({
            id: item.id,
            company: item.company,
            position: item.position,
            startDate: item.startDate ?? "",
            endDate: item.endDate ?? "",
            location: item.location ?? "",
            description: item.description ?? "",
            current: item.isCurrent,
            isCurrent: item.isCurrent,
          })),
      skills:
        [...(resume.skills ?? [])]
          .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
          .map((item) => ({
            id: item.id,
            name: item.name,
            level: item.level,
          })),
      selectedTemplate: resume.selectedTemplate,
      designSettings: {
        themeColor: resume.themeColor,
        fontFamily: resume.fontFamily as ResumeContent["designSettings"]["fontFamily"],
        scale: Number(resume.scale),
        textAlignment:
          resume.textAlignment as ResumeContent["designSettings"]["textAlignment"],
        fontSizes: {
          header: Number(resume.fontSizeHeader),
          sectionTitle: Number(resume.fontSizeSectionTitle),
          body: Number(resume.fontSizeBody),
        },
        spacing: {
          lineHeight: Number(resume.lineHeight),
          sectionPadding: Number(resume.sectionPadding),
          itemGap: Number(resume.itemGap),
        },
      },
    },
  };
}

export function mapResumeRowToSummary(row: {
  id: string;
  title: string | null;
  updatedAt: Date | null;
}): ResumeSummary {
  return {
    id: row.id,
    title: row.title ?? DEFAULT_TITLE,
    updatedAt: row.updatedAt?.toISOString() ?? null,
  };
}

export function mapSaveRequestToResumeValues(payload: SaveResumeRequest) {
  const designSettings = {
    ...DEFAULT_DESIGN_SETTINGS,
    ...payload.content.designSettings,
    fontSizes: {
      ...DEFAULT_DESIGN_SETTINGS.fontSizes,
      ...payload.content.designSettings.fontSizes,
    },
    spacing: {
      ...DEFAULT_DESIGN_SETTINGS.spacing,
      ...payload.content.designSettings.spacing,
    },
  };

  return {
    title: payload.title ?? DEFAULT_TITLE,
    fullName: payload.content.personalInfo.fullName,
    email: payload.content.personalInfo.email,
    phone: payload.content.personalInfo.phone || null,
    address: payload.content.personalInfo.address || null,
    professionalTitle: payload.content.personalInfo.title || null,
    summary: payload.content.personalInfo.summary || null,
    selectedTemplate: payload.content.selectedTemplate ?? "classic",
    themeColor: designSettings.themeColor,
    fontFamily: designSettings.fontFamily,
    fontSizeHeader: String(designSettings.fontSizes.header),
    fontSizeSectionTitle: String(designSettings.fontSizes.sectionTitle),
    fontSizeBody: String(designSettings.fontSizes.body),
    scale: String(designSettings.scale),
    lineHeight: String(designSettings.spacing.lineHeight),
    sectionPadding: String(designSettings.spacing.sectionPadding),
    itemGap: String(designSettings.spacing.itemGap),
    textAlignment: designSettings.textAlignment,
    updatedAt: new Date(),
  };
}
