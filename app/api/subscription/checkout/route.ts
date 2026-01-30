import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getPolarClient, isPolarConfigured } from "@/lib/polar";
import { getEnvVar } from "@/lib/env-validation";
import { logger } from "@/lib/logger";

/**
 * POST /api/subscription/checkout
 * Create a Polar checkout session for subscription
 */
export async function POST(req: NextRequest) {
  try {
    if (!isPolarConfigured()) {
      return NextResponse.json(
        { error: "Payment system is not configured" },
        { status: 503 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const polar = getPolarClient();
    if (!polar) {
      return NextResponse.json(
        { error: "Payment system is not available" },
        { status: 503 }
      );
    }

    const productPriceId = getEnvVar("POLAR_PRODUCT_PRICE_ID");
    if (!productPriceId) {
      logger.error("POLAR_PRODUCT_PRICE_ID is not configured");
      return NextResponse.json(
        { error: "Subscription product is not configured" },
        { status: 500 }
      );
    }

    const baseUrl = getEnvVar("NEXT_PUBLIC_APP_URL");
    const successUrl = `${baseUrl}/dashboard?subscription=success`;

    // Create checkout session
    const result = await polar.checkouts.create({
      products: [productPriceId],
      successUrl,
      customerEmail: session.user.email,
      customerName: session.user.name || undefined,
      metadata: {
        userId: session.user.id,
        userEmail: session.user.email,
      },
    });

    if (!result.ok) {
      logger.error("Failed to create Polar checkout session", {
        error: result.error,
        userId: session.user.id,
      });
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    const checkout = result.value;

    return NextResponse.json({
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
    });
  } catch (error) {
    logger.error("Error creating checkout session", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
