import fastifyCors from "@fastify/cors";
import type { FastifyPluginAsync } from "fastify";

import { getTrustedOrigins } from "@/config/env";

export const registerCorsPlugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifyCors, {
    credentials: true,
    origin: getTrustedOrigins(),
  });
};
