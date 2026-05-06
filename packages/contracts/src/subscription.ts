import { z } from "zod";

import { messageResponseSchema } from "./photo";

export const subscriptionRecordSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
  currentPeriodEnd: z.string().nullable(),
  cancelAtPeriodEnd: z.boolean(),
});

export const subscriptionStatusResponseSchema = z.object({
  hasActiveSubscription: z.boolean(),
  subscription: subscriptionRecordSchema.nullable(),
});

export const subscriptionCheckoutResponseSchema = z.object({
  checkoutUrl: z.string().url(),
  checkoutId: z.string(),
});

export const subscriptionWebhookResponseSchema = z.union([
  z.object({
    received: z.literal(true),
  }),
  messageResponseSchema,
]);

export type SubscriptionStatusResponse = z.infer<
  typeof subscriptionStatusResponseSchema
>;
