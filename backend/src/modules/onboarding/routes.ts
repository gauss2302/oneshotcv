import type { FastifyPluginAsync } from "fastify";

import { getSessionFromRequest } from "@/modules/auth/session";

import { onboardingService } from "./service";

export const registerOnboardingRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/user/onboarding/status", async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const hasCompletedOnboarding = await onboardingService.getStatus(
      session.user.id
    );

    return reply.send({
      hasCompletedOnboarding,
    });
  });

  app.post("/api/user/onboarding/complete", async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    await onboardingService.complete(session.user.id);

    return reply.send({
      success: true,
      message: "Onboarding marked as complete",
    });
  });
};
