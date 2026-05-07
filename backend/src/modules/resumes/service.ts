import type { ResumeDocument, ResumeSummary, SaveResumeRequest } from "@/contracts/resume";
import { eq } from "drizzle-orm";

import { db } from "@/infrastructure/db/client";
import {
  education,
  experience,
  resumes,
  skills,
} from "@/infrastructure/db/schema";

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
      payload.content.education.map((item) => ({
        resumeId,
        institution: item.institution,
        degree: item.degree || null,
        startDate: item.startDate || null,
        endDate: item.endDate || null,
        description: item.description || null,
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

  async saveResume(userId: string, payload: SaveResumeRequest): Promise<string> {
    const resumeValues = mapSaveRequestToResumeValues(payload);

    if (payload.id) {
      const existingResume = await resumeRepository.findResumeForUser(userId, payload.id);
      if (!existingResume) {
        throw new Error("Resume not found");
      }

      await db.transaction(async (tx) => {
        await tx
          .update(resumes)
          .set(resumeValues)
          .where(eq(resumes.id, payload.id!));

        await replaceResumeCollections(tx, payload.id!, payload);
      });

      return payload.id;
    }

    if (payload.createNew) {
      const [newResume] = await db
        .insert(resumes)
        .values({
          ...resumeValues,
          userId,
        })
        .returning({ id: resumes.id });

      await db.transaction(async (tx) => {
        await replaceResumeCollections(tx, newResume.id, payload);
      });

      return newResume.id;
    }

    const existingResume = await resumeRepository.findFirstResumeForUser(userId);
    if (existingResume) {
      await db.transaction(async (tx) => {
        await tx
          .update(resumes)
          .set(resumeValues)
          .where(eq(resumes.id, existingResume.id));

        await replaceResumeCollections(tx, existingResume.id, payload);
      });

      return existingResume.id;
    }

    const [newResume] = await db
      .insert(resumes)
      .values({
        ...resumeValues,
        userId,
      })
      .returning({ id: resumes.id });

    await db.transaction(async (tx) => {
      await replaceResumeCollections(tx, newResume.id, payload);
    });

    return newResume.id;
  },

  async deleteResume(userId: string, resumeId: string): Promise<void> {
    await resumeRepository.deleteResumeForUser(userId, resumeId);
  },
};
