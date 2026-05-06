import { eq } from "drizzle-orm";

import { db } from "@/infrastructure/db/client";
import { user } from "@/infrastructure/db/schema";

export const onboardingService = {
  async getStatus(userId: string): Promise<boolean> {
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        hasCompletedOnboarding: true,
      },
    });

    return userRecord?.hasCompletedOnboarding ?? false;
  },

  async complete(userId: string): Promise<void> {
    await db
      .update(user)
      .set({
        hasCompletedOnboarding: true,
      })
      .where(eq(user.id, userId));
  },
};
