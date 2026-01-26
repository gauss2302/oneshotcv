import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    // Get authenticated session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update user's onboarding status
    await db
      .update(user)
      .set({ hasCompletedOnboarding: true })
      .where(eq(user.id, session.user.id));

    return NextResponse.json(
      { success: true, message: "Onboarding marked as complete" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error completing onboarding", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
