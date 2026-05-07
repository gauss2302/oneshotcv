import {
  onboardingCompleteResponseSchema,
  onboardingStatusResponseSchema,
} from "@contracts/onboarding";

import { apiFetch } from "./client";

export async function fetchOnboardingStatus() {
  const response = await apiFetch<unknown>("/api/user/onboarding/status", {
    cache: "no-store",
  });

  return onboardingStatusResponseSchema.parse(response);
}

export async function completeOnboarding() {
  const response = await apiFetch<unknown>("/api/user/onboarding/complete", {
    method: "POST",
  });

  return onboardingCompleteResponseSchema.parse(response);
}
