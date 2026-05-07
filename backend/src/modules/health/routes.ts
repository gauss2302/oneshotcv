import type { FastifyPluginAsync } from "fastify";

import { checkBackendDatabaseHealth } from "@/infrastructure/db/client";
import { checkBackendStorageHealth } from "@/infrastructure/storage/minio";

export const registerHealthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/health", async (_request, reply) => {
    const databaseHealthy = await checkBackendDatabaseHealth();
    const storageHealthy = await checkBackendStorageHealth();

    const checks: Record<string, { status: "healthy" | "unhealthy" | "skipped" }> = {
      database: {
        status: databaseHealthy ? "healthy" : "unhealthy",
      },
      storage: {
        status:
          storageHealthy === null
            ? "skipped"
            : storageHealthy
              ? "healthy"
              : "unhealthy",
      },
    };

    const isHealthy = Object.values(checks).every(
      (check) => check.status === "healthy" || check.status === "skipped"
    );

    return reply.code(isHealthy ? 200 : 503).send({
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      checks,
    });
  });
};
