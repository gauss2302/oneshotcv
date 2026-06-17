import type { ResumeDocument, ResumeSummary, SaveResumeRequest } from "@/contracts/resume";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/infrastructure/db/client";
import {
  education,
  experience,
  resumes,
  skills,
} from "@/infrastructure/db/schema";

import { ResumeNotFoundError, ResumeVersionConflictError } from "./errors";
import {
  mapResumeRecordToDocument,
  mapResumeRowToSummary,
  mapSaveRequestToResumeValues,
} from "./mappers";
import { resumeRepository } from "./repository";

async function replaceResumeCollections(
  tx: Parameters<typeof db.transaction>[0] extends (arg: infer T) => unknown ? T : never,
  resumeId: string,
  payload: SaveResumeRequest
): Promise<void> {
  await tx.delete(education).where(eq(education.resumeId, resumeId));
  if (payload.content.education.length > 0) {
    await tx.insert(education).values(
      payload.content.education.map((item, index) => ({
        resumeId,
        institution: item.institution,
        degree: item.degree || null,
        startDate: item.startDate || null,
        endDate: item.endDate || null,
        description: item.description || null,
        sortOrder: index,
      }))
    );
  }

  await tx.delete(experience).where(eq(experience.resumeId, resumeId));
  if (payload.content.experience.length > 0) {
    await tx.insert(experience).values(
      payload.content.experience.map((item, index) => ({
        resumeId,
        company: item.company,
        position: item.position,
        startDate: item.startDate || null,
        endDate: item.endDate || null,
        location: item.location || null,
        description: item.description || null,
        isCurrent: item.isCurrent ?? item.current ?? false,
        sortOrder: index,
      }))
    );
  }

  await tx.delete(skills).where(eq(skills.resumeId, resumeId));
  if (payload.content.skills.length > 0) {
    await tx.insert(skills).values(
      payload.content.skills.map((item, index) => ({
        resumeId,
        name: item.name,
        level: item.level,
        sortOrder: index,
      }))
    );
  }
}

type SaveResumeResult = {
  id: string;
  version: number;
};

export const resumeService = {
  async getResume(userId: string, resumeId?: string): Promise<ResumeDocument | null> {
    const resume = await resumeRepository.findResumeForUser(userId, resumeId);
    if (!resume) {
      return null;
    }

    return mapResumeRecordToDocument(resume);
  },

  async listResumes(userId: string): Promise<ResumeSummary[]> {
    const rows = await resumeRepository.listResumeSummaries(userId);
    return rows.map(mapResumeRowToSummary);
  },

  async saveResume(userId: string, payload: SaveResumeRequest): Promise<SaveResumeResult> {
    if (payload.id) {
      const existingResume = await resumeRepository.findResumeForUser(userId, payload.id);
      if (!existingResume) {
        throw new ResumeNotFoundError();
      }

      const resumeValues = mapSaveRequestToResumeValues(payload, {
        existingTitle: existingResume.title,
      });

      const savedResume = await db.transaction(async (tx) => {
        const [updatedResume] = await tx
          .update(resumes)
          .set({
            ...resumeValues,
            version: sql`${resumes.version} + 1`,
          })
          .where(
            payload.version === undefined
              ? and(eq(resumes.id, payload.id!), eq(resumes.userId, userId))
              : and(
                  eq(resumes.id, payload.id!),
                  eq(resumes.userId, userId),
                  eq(resumes.version, payload.version)
                )
          )
          .returning({
            id: resumes.id,
            version: resumes.version,
          });

        if (!updatedResume) {
          throw payload.version === undefined
            ? new ResumeNotFoundError()
            : new ResumeVersionConflictError();
        }

        await replaceResumeCollections(tx, payload.id!, payload);
        return updatedResume;
      });

      return savedResume;
    }

    if (payload.createNew) {
      const resumeValues = mapSaveRequestToResumeValues(payload);

      const newResume = await db.transaction(async (tx) => {
        const [newResume] = await tx
          .insert(resumes)
          .values({
            ...resumeValues,
            userId,
          })
          .returning({ id: resumes.id, version: resumes.version });

        await replaceResumeCollections(tx, newResume.id, payload);
        return newResume;
      });

      return newResume;
    }

    const existingResume = await resumeRepository.findFirstResumeForUser(userId);
    if (existingResume) {
      const resumeValues = mapSaveRequestToResumeValues(payload, {
        existingTitle: existingResume.title,
      });

      const savedResume = await db.transaction(async (tx) => {
        const [updatedResume] = await tx
          .update(resumes)
          .set({
            ...resumeValues,
            version: sql`${resumes.version} + 1`,
          })
          .where(and(eq(resumes.id, existingResume.id), eq(resumes.userId, userId)))
          .returning({
            id: resumes.id,
            version: resumes.version,
          });

        if (!updatedResume) {
          throw new ResumeNotFoundError();
        }

        await replaceResumeCollections(tx, existingResume.id, payload);
        return updatedResume;
      });

      return savedResume;
    }

    const resumeValues = mapSaveRequestToResumeValues(payload);

    const newResume = await db.transaction(async (tx) => {
      const [newResume] = await tx
        .insert(resumes)
        .values({
          ...resumeValues,
          userId,
        })
        .returning({ id: resumes.id, version: resumes.version });

      await replaceResumeCollections(tx, newResume.id, payload);
      return newResume;
    });

    return newResume;
  },

  async deleteResume(userId: string, resumeId: string): Promise<void> {
    await resumeRepository.deleteResumeForUser(userId, resumeId);
  },
};
