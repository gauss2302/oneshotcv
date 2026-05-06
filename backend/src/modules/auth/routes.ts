import type { FastifyPluginAsync } from "fastify";
import { fromNodeHeaders } from "better-auth/node";

import { getBackendEnv } from "@/config/env";
import { backendAuth } from "./auth";

const METHODS_WITHOUT_BODY = new Set(["GET", "HEAD"]);

function buildAuthRequestBody(
  method: string,
  body: unknown,
  contentType: string | undefined
): BodyInit | undefined {
  if (METHODS_WITHOUT_BODY.has(method) || body === undefined || body === null) {
    return undefined;
  }

  if (typeof body === "string" || body instanceof Uint8Array) {
    return body;
  }

  if (contentType?.includes("application/x-www-form-urlencoded") && typeof body === "object") {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      searchParams.set(key, String(value));
    }
    return searchParams.toString();
  }

  return JSON.stringify(body);
}

export const registerBackendAuthRoutes: FastifyPluginAsync = async (app) => {
  const env = getBackendEnv();

  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      const targetUrl = new URL(request.url, env.INDEPENDENT_BACKEND_URL);
      const headers = fromNodeHeaders(request.headers);
      const contentType = request.headers["content-type"];
      const body = buildAuthRequestBody(request.method, request.body, contentType);

      const authRequest = new Request(targetUrl, {
        method: request.method,
        headers,
        body,
      });

      const response = await backendAuth.handler(authRequest);
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });
      reply.status(response.status);

      if (!response.body) {
        return reply.send();
      }

      const responseText = await response.text();
      return reply.send(responseText);
    },
  });
};
