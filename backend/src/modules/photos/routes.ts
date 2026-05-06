import type { FastifyPluginAsync } from "fastify";

import { getSessionFromRequest } from "@/modules/auth/session";
import {
  backendRateLimitConfigs,
  checkBackendRateLimit,
  getBackendClientIdentifier,
} from "@/plugins/rate-limit";

import {
  attachPhotoRequestSchema,
  detachPhotoRequestSchema,
  photoIdSchema,
  recropPhotoRequestSchema,
} from "./schemas";
import { photoService } from "./service";

function getErrorStatus(error: Error): number {
  switch (error.message) {
    case "This template does not support profile photos":
      return 400;
    case "Photo not found or access denied":
    case "Resume photo not found or access denied":
    case "Resume not found or access denied":
      return 404;
    case "No file provided":
    case "Invalid file type. Only JPEG, PNG, and WebP are allowed.":
    case "File too large. Maximum size is 10MB.":
    case "File type mismatch. The file content does not match the declared type.":
    case "Image too small. Minimum dimensions are 200x200 pixels.":
      return 400;
    default:
      if (error.message.startsWith("Maximum ")) {
        return 400;
      }

      return 500;
  }
}

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
      return reply.code(400).send({ error: "No file provided" });
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
      if (error instanceof Error) {
        return reply.code(getErrorStatus(error)).send({
          error: error.message,
        });
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
      if (error instanceof Error) {
        const status = getErrorStatus(error);
        return reply.code(status).send({
          error: error.message,
        });
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
      if (error instanceof Error) {
        return reply.code(getErrorStatus(error)).send({
          error: error.message,
        });
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
      if (error instanceof Error) {
        return reply.code(getErrorStatus(error)).send({
          error: error.message,
        });
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
      if (error instanceof Error) {
        return reply.code(getErrorStatus(error)).send({
          error: error.message,
        });
      }

      throw error;
    }
  });
};
