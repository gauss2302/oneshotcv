import Fastify, { type FastifyServerOptions } from "fastify";

import { registerBackendAuthRoutes } from "@/modules/auth/routes";
import { registerHealthRoutes } from "@/modules/health/routes";
import { registerResumeRoutes } from "@/modules/resumes/routes";
import { registerCookiePlugin } from "@/plugins/cookies";
import { registerCorsPlugin } from "@/plugins/cors";

export async function buildBackendApp(options: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: false,
    ...options,
  });

  await app.register(registerCookiePlugin);
  await app.register(registerCorsPlugin);
  await app.register(registerBackendAuthRoutes);
  await app.register(registerHealthRoutes);
  await app.register(registerResumeRoutes);

  return app;
}
