import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET() {
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

    // Get user's onboarding status
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: {
        hasCompletedOnboarding: true,
      },
    });

    return NextResponse.json(
      {
        hasCompletedOnboarding: userRecord?.hasCompletedOnboarding ?? false,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error checking onboarding status", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: "Failed to check onboarding status" },
      { status: 500 }
    );
  }
}
