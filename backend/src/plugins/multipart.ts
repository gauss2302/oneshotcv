import fastifyMultipart from "@fastify/multipart";
import type { FastifyPluginAsync } from "fastify";

export const registerMultipartPlugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifyMultipart);
};
