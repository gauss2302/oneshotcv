import fastifyMultipart from "@fastify/multipart";
import fastifyRawBody from "fastify-raw-body";
import Fastify, { type FastifyServerOptions } from "fastify";

import { registerBackendAuthRoutes } from "@/modules/auth/routes";
import { registerHealthRoutes } from "@/modules/health/routes";
import { registerResumeRoutes } from "@/modules/resumes/routes";
import { registerOnboardingRoutes } from "@/modules/onboarding/routes";
import { registerCookiePlugin } from "@/plugins/cookies";
import { registerCorsPlugin } from "@/plugins/cors";
import { registerPhotoRoutes } from "@/modules/photos/routes";
import { registerSubscriptionRoutes } from "@/modules/subscriptions/routes";

export async function buildBackendApp(options: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: false,
    ...options,
  });

  await app.register(registerCookiePlugin);
  await app.register(registerCorsPlugin);
  await app.register(fastifyMultipart, {
    // Per-file upload cap. Without an explicit limit, @fastify/multipart falls
    // back to Fastify's 1 MB bodyLimit, so any photo over 1 MB fails with 413
    // (Payload Too Large) before reaching the photos service — which enforces
    // its own 10 MB max (MAX_FILE_SIZE) and returns a friendlier error.
    limits: { fileSize: 10 * 1024 * 1024 },
  });
  await app.register(fastifyRawBody, {
    field: "rawBody",
    global: false,
    encoding: "utf8",
    runFirst: true,
  });
  await app.register(registerBackendAuthRoutes);
  await app.register(registerHealthRoutes);
  await app.register(registerResumeRoutes);
  await app.register(registerPhotoRoutes);
  await app.register(registerOnboardingRoutes);
  await app.register(registerSubscriptionRoutes);

  return app;
}
