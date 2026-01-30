import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { polarSubscriptions } from "@/db/schema";
import { eq, and, gt, or } from "drizzle-orm";
import { logger } from "@/lib/logger";

/**
 * GET /api/subscription/status
 * Check if the current user has an active subscription
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check for active subscription in database
    const activeSubscription = await db.query.polarSubscriptions.findFirst({
      where: and(
        eq(polarSubscriptions.userId, session.user.id),
        eq(polarSubscriptions.status, "active"),
        or(
          gt(polarSubscriptions.currentPeriodEnd ?? new Date(0), new Date()),
          // Also include subscriptions without period end (lifetime)
          eq(polarSubscriptions.currentPeriodEnd, null)
        )
      ),
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    });

    const hasActiveSubscription = !!activeSubscription;

    return NextResponse.json({
      hasActiveSubscription,
      subscription: activeSubscription
        ? {
            id: activeSubscription.id,
            status: activeSubscription.status,
            currentPeriodEnd: activeSubscription.currentPeriodEnd,
            cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
          }
        : null,
    });
  } catch (error) {
    logger.error("Error checking subscription status", error instanceof Error ? error : undefined);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
