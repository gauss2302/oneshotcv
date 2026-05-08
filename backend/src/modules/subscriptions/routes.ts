import type { FastifyPluginAsync, FastifyRequest } from "fastify";

import { getBackendEnv } from "@/config/env";
import { ApiError } from "@/lib/api-error";
import { getSessionFromRequest } from "@/modules/auth/session";

import {
  handlePolarWebhookEvent,
  isPolarWebhookVerificationError,
  parsePolarWebhookEvent,
} from "./webhook";
import { subscriptionService } from "./service";

type RawBodyRequest = FastifyRequest & {
  rawBody?: string;
};

export const registerSubscriptionRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/subscription/status", async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const subscriptionStatus = await subscriptionService.getStatus(
      session.user.id
    );
    return reply.send(subscriptionStatus);
  });

  app.post("/api/subscription/checkout", async (request, reply) => {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    try {
      const checkoutSession = await subscriptionService.createCheckoutSession({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      });

      return reply.send(checkoutSession);
    } catch (error) {
      if (error instanceof ApiError) {
        return reply.code(error.status).send({ error: error.message });
      }

      throw error;
    }
  });

  app.post(
    "/api/subscription/webhook",
    {
      config: {
        rawBody: true,
      },
    },
    async (request, reply) => {
      const env = getBackendEnv();
      if (!env.POLAR_WEBHOOK_SECRET) {
        return reply.code(500).send({ error: "Webhook secret not configured" });
      }

      const rawBody = (request as RawBodyRequest).rawBody;
      if (!rawBody) {
        return reply.code(400).send({ error: "Missing webhook body" });
      }

      const headers = Object.fromEntries(
        Object.entries(request.headers).flatMap(([key, value]) => {
          if (typeof value === "string") {
            return [[key, value]];
          }

          if (Array.isArray(value) && value.length > 0) {
            return [[key, value[0]]];
          }

          return [];
        })
      );

      try {
        const event = parsePolarWebhookEvent(
          rawBody,
          headers,
          env.POLAR_WEBHOOK_SECRET
        );
        await handlePolarWebhookEvent(event);
        return reply.send({ received: true });
      } catch (error) {
        if (isPolarWebhookVerificationError(error)) {
          return reply.code(401).send({ error: "Invalid signature" });
        }

        throw error;
      }
    }
  );
};
