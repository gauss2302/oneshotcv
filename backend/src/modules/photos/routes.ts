import type { FastifyPluginAsync } from "fastify";

import { ApiError } from "@/lib/api-error";
import { getSessionFromRequest } from "@/modules/auth/session";
import {
  backendRateLimitConfigs,
  checkBackendRateLimit,
  getBackendClientIdentifier,
} from "@/plugins/rate-limit";

import { NoFileProvidedError } from "./errors";
import {
  attachPhotoRequestSchema,
  detachPhotoRequestSchema,
  photoIdSchema,
  recropPhotoRequestSchema,
} from "./schemas";
import { photoService } from "./service";

export const registerPhotoRoutes: FastifyPluginAsync = async (app) => {
  app.post("/api/photos/upload", async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const rateLimit = checkBackendRateLimit(
      getBackendClientIdentifier(request.headers),
      backendRateLimitConfigs.upload
    );
    if (!rateLimit.allowed) {
      return reply.code(429).headers({
        "X-RateLimit-Limit": backendRateLimitConfigs.upload.maxRequests.toString(),
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
        "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
      }).send({
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      });
    }

    const file = await request.file();
    if (!file) {
      const noFile = new NoFileProvidedError();
      return reply.code(noFile.status).send({ error: noFile.message });
    }

    try {
      const uploadedPhoto = await photoService.uploadPhoto(session.user.id, {
        filename: file.filename,
        mimetype: file.mimetype,
        toBuffer: () => file.toBuffer(),
      });

      return reply.send({
        success: true,
        photo: uploadedPhoto,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return reply.code(error.status).send({ error: error.message });
      }

      throw error;
    }
  });

  app.get("/api/photos/library", async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const photos = await photoService.listPhotos(session.user.id);
    return reply.send({
      success: true,
      photos,
    });
  });

  app.post("/api/photos/attach", async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const parsedRequest = attachPhotoRequestSchema.safeParse(request.body);
    if (!parsedRequest.success) {
      return reply.code(400).send({
        error: "Invalid request payload",
        details: parsedRequest.error.issues,
      });
    }

    try {
      const resumePhoto = await photoService.attachPhoto(
        session.user.id,
        parsedRequest.data
      );

      return reply.send({
        success: true,
        resumePhoto,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return reply.code(error.status).send({ error: error.message });
      }

      throw error;
    }
  });

  app.post("/api/photos/crop", async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const parsedRequest = recropPhotoRequestSchema.safeParse(request.body);
    if (!parsedRequest.success) {
      return reply.code(400).send({
        error: "Invalid request payload",
        details: parsedRequest.error.issues,
      });
    }

    try {
      const croppedPhoto = await photoService.recropPhoto(
        session.user.id,
        parsedRequest.data
      );

      return reply.send({
        success: true,
        ...croppedPhoto,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return reply.code(error.status).send({ error: error.message });
      }

      throw error;
    }
  });

  app.post("/api/photos/detach", async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const parsedRequest = detachPhotoRequestSchema.safeParse(request.body);
    if (!parsedRequest.success) {
      return reply.code(400).send({
        error: "Invalid request payload",
        details: parsedRequest.error.issues,
      });
    }

    const { resumeId, resumePhotoId, photoId } = parsedRequest.data;
    if (!resumeId && !resumePhotoId && !photoId) {
      return reply.code(400).send({
        error: "Missing resumeId, resumePhotoId, or photoId",
      });
    }

    try {
      await photoService.detachPhoto(session.user.id, parsedRequest.data);
      return reply.send({
        success: true,
        message: "Photo detached successfully",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return reply.code(error.status).send({ error: error.message });
      }

      throw error;
    }
  });

  app.delete("/api/photos/:id", async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const photoId = (request.params as { id?: unknown }).id;
    const parsedPhotoId = photoIdSchema.safeParse(photoId);
    if (!parsedPhotoId.success) {
      return reply.code(400).send({
        error: "Invalid photo ID format",
      });
    }

    const force = (request.query as { force?: string | undefined }).force === "true";

    try {
      const result = await photoService.deletePhoto(
        session.user.id,
        parsedPhotoId.data,
        force
      );

      if (result.conflict) {
        return reply.code(409).send({
          error: "Photo is in use",
          inUse: true,
          usageCount: result.usageCount,
          message: `This photo is used in ${result.usageCount} resume(s). Use force=true to delete anyway.`,
        });
      }

      return reply.send({
        success: true,
        message: "Photo deleted successfully",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return reply.code(error.status).send({ error: error.message });
      }

      throw error;
    }
  });
};
