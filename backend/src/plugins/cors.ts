import fastifyCors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

import { getTrustedOrigins } from "@/config/env";

export async function registerCorsPlugin(app: FastifyInstance): Promise<void> {
  await app.register(fastifyCors, {
    credentials: true,
    origin: getTrustedOrigins(),
  });
}
