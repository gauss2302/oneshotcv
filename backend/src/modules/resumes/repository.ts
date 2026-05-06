import { and, desc, eq } from "drizzle-orm";

import { db } from "@/infrastructure/db/client";
import { resumes } from "@/infrastructure/db/schema";

export const resumeRepository = {
  findResumeForUser(userId: string, resumeId?: string) {
    return db.query.resumes.findFirst({
      where: resumeId
        ? and(eq(resumes.userId, userId), eq(resumes.id, resumeId))
        : eq(resumes.userId, userId),
      with: {
        education: true,
        experience: true,
        skills: true,
        resumePhoto: {
          with: {
            photo: true,
          },
        },
      },
    });
  },

  findFirstResumeForUser(userId: string) {
    return db.query.resumes.findFirst({
      where: eq(resumes.userId, userId),
      orderBy: [desc(resumes.updatedAt)],
    });
  },

  listResumeSummaries(userId: string) {
    return db
      .select({
        id: resumes.id,
        title: resumes.title,
        updatedAt: resumes.updatedAt,
      })
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.updatedAt));
  },

  deleteResumeForUser(userId: string, resumeId: string) {
    return db
      .delete(resumes)
      .where(and(eq(resumes.userId, userId), eq(resumes.id, resumeId)));
  },
};
