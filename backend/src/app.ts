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

  await registerCookiePlugin(app);
  await registerCorsPlugin(app);
  await registerBackendAuthRoutes(app);
  await registerHealthRoutes(app);
  await registerResumeRoutes(app);

  return app;
}
