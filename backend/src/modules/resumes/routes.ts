import type { FastifyPluginAsync } from "fastify";

import { ApiError } from "@/lib/api-error";
import { getSessionFromRequest } from "@/modules/auth/session";

import {
  deleteResumeRequestSchema,
  resumeIdSchema,
  saveResumeRequestSchema,
} from "./schemas";
import { resumeService } from "./service";

export const registerResumeRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/resume", async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const maybeResumeId = (request.query as { id?: unknown } | undefined)?.id;
    if (maybeResumeId !== undefined) {
      const parsedId = resumeIdSchema.safeParse(maybeResumeId);
      if (!parsedId.success) {
        return reply.code(400).send({ error: "Invalid resume ID format" });
      }
    }

    const resume = await resumeService.getResume(
      session.user.id,
      typeof maybeResumeId === "string" ? maybeResumeId : undefined
    );

    if (!resume) {
      return reply.send({ content: null });
    }

    return reply.send(resume);
  });

  app.get("/api/resume/list", async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return reply.send({ resumes: [] });
    }

    const resumes = await resumeService.listResumes(session.user.id);
    return reply.send({ resumes });
  });

  app.post("/api/resume", async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const parsedRequest = saveResumeRequestSchema.safeParse(request.body);
    if (!parsedRequest.success) {
      return reply.code(400).send({
        error: "Validation failed",
        details: parsedRequest.error.issues,
      });
    }

    try {
      const savedResume = await resumeService.saveResume(
        session.user.id,
        parsedRequest.data
      );

      return reply.send({
        success: true,
        id: savedResume.id,
        version: savedResume.version,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return reply.code(error.status).send({ error: error.message });
      }

      throw error;
    }
  });

  app.delete("/api/resume", async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const parsedRequest = deleteResumeRequestSchema.safeParse(request.body);
    if (!parsedRequest.success) {
      return reply.code(400).send({ error: "Resume id is required" });
    }

    await resumeService.deleteResume(session.user.id, parsedRequest.data.id);
    return reply.send({ success: true });
  });
};
