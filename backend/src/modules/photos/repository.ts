import { and, count, desc, eq } from "drizzle-orm";

import { db } from "@/infrastructure/db/client";
import { photos, resumePhotos, resumes } from "@/infrastructure/db/schema";

export const photoRepository = {
  countUserPhotos(userId: string) {
    return db
      .select({ count: count() })
      .from(photos)
      .where(eq(photos.userId, userId));
  },

  listUserPhotos(userId: string) {
    return db
      .select()
      .from(photos)
      .where(eq(photos.userId, userId))
      .orderBy(desc(photos.createdAt));
  },

  findUserPhoto(userId: string, photoId: string) {
    return db.query.photos.findFirst({
      where: and(eq(photos.userId, userId), eq(photos.id, photoId)),
    });
  },

  findUserResume(userId: string, resumeId: string) {
    return db.query.resumes.findFirst({
      where: and(eq(resumes.userId, userId), eq(resumes.id, resumeId)),
    });
  },

  findResumePhotoByResume(resumeId: string) {
    return db.query.resumePhotos.findFirst({
      where: eq(resumePhotos.resumeId, resumeId),
    });
  },

  findResumePhotoForUser(userId: string, condition: { resumePhotoId?: string; resumeId?: string; photoId?: string }) {
    if (condition.resumePhotoId) {
      return db
        .select({
          resumePhoto: resumePhotos,
          resume: resumes,
        })
        .from(resumePhotos)
        .innerJoin(resumes, eq(resumePhotos.resumeId, resumes.id))
        .where(
          and(eq(resumes.userId, userId), eq(resumePhotos.id, condition.resumePhotoId))
        )
        .limit(1);
    }

    if (condition.resumeId) {
      return db
        .select({
          resumePhoto: resumePhotos,
          resume: resumes,
        })
        .from(resumePhotos)
        .innerJoin(resumes, eq(resumePhotos.resumeId, resumes.id))
        .where(
          and(eq(resumes.userId, userId), eq(resumePhotos.resumeId, condition.resumeId))
        )
        .limit(1);
    }

    return db
      .select({
        resumePhoto: resumePhotos,
        resume: resumes,
      })
      .from(resumePhotos)
      .innerJoin(resumes, eq(resumePhotos.resumeId, resumes.id))
      .where(
        and(eq(resumes.userId, userId), eq(resumePhotos.photoId, condition.photoId!))
      )
      .limit(1);
  },

  findResumePhotoWithPhoto(userId: string, resumePhotoId: string) {
    return db
      .select({
        resumePhoto: resumePhotos,
        photo: photos,
        resume: resumes,
      })
      .from(resumePhotos)
      .innerJoin(photos, eq(resumePhotos.photoId, photos.id))
      .innerJoin(resumes, eq(resumePhotos.resumeId, resumes.id))
      .where(and(eq(resumePhotos.id, resumePhotoId), eq(resumes.userId, userId)))
      .limit(1);
  },

  listPhotoUsages(photoId: string) {
    return db
      .select()
      .from(resumePhotos)
      .where(eq(resumePhotos.photoId, photoId));
  },
};
