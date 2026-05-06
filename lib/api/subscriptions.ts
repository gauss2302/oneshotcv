import {
  subscriptionCheckoutResponseSchema,
  subscriptionStatusResponseSchema,
} from "@contracts/subscription";

import { apiFetch } from "./client";

export async function fetchSubscriptionStatus() {
  const response = await apiFetch<unknown>("/api/subscription/status", {
    method: "GET",
  });

  return subscriptionStatusResponseSchema.parse(response);
}

export async function createSubscriptionCheckout() {
  const response = await apiFetch<unknown>("/api/subscription/checkout", {
    method: "POST",
  });

  return subscriptionCheckoutResponseSchema.parse(response);
}
