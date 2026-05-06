import type { FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";

import { backendAuth } from "./auth";

export async function getSessionFromRequest(request: FastifyRequest) {
  return backendAuth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });
}
