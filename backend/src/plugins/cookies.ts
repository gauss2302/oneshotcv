import fastifyCookie from "@fastify/cookie";
import type { FastifyPluginAsync } from "fastify";

export const registerCookiePlugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifyCookie);
};
