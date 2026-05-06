import { z } from "zod";

export const onboardingStatusResponseSchema = z.object({
  hasCompletedOnboarding: z.boolean(),
});

export const onboardingCompleteResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().min(1),
});

export type OnboardingStatusResponse = z.infer<
  typeof onboardingStatusResponseSchema
>;
