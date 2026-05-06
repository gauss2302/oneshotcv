import fastifyMultipart from "@fastify/multipart";
import Fastify, { type FastifyServerOptions } from "fastify";

import { registerBackendAuthRoutes } from "@/modules/auth/routes";
import { registerHealthRoutes } from "@/modules/health/routes";
import { registerResumeRoutes } from "@/modules/resumes/routes";
import { registerCookiePlugin } from "@/plugins/cookies";
import { registerCorsPlugin } from "@/plugins/cors";
import { registerPhotoRoutes } from "@/modules/photos/routes";

export async function buildBackendApp(options: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: false,
    ...options,
  });

  await app.register(registerCookiePlugin);
  await app.register(registerCorsPlugin);
  await app.register(fastifyMultipart);
  await app.register(registerBackendAuthRoutes);
  await app.register(registerHealthRoutes);
  await app.register(registerResumeRoutes);
  await app.register(registerPhotoRoutes);

  return app;
}
