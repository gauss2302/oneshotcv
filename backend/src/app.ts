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
  await app.register(fastifyMultipart);
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
