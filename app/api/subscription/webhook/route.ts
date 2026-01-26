import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { polarCustomers, polarSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getEnvVar } from "@/lib/env-validation";
import { logger } from "@/lib/logger";
import crypto from "crypto";

/**
 * POST /api/subscription/webhook
 * Handle Polar webhook events
 */
export async function POST(req: NextRequest) {
  try {
    const webhookSecret = getEnvVar("POLAR_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logger.error("POLAR_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const signature = req.headers.get("x-polar-signature");
    const timestamp = req.headers.get("x-polar-timestamp");

    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 401 }
      );
    }

    const body = await req.text();
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(`${timestamp}.${body}`)
      .digest("hex");

    if (signature !== expectedSignature) {
      logger.warn("Invalid webhook signature", {
        received: signature.substring(0, 10) + "...",
        expected: expectedSignature.substring(0, 10) + "...",
      });
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const { type, data } = payload;

    logger.info("Received Polar webhook", { type, eventId: data?.id });

    // Handle different webhook event types
    switch (type) {
      case "checkout.completed": {
        await handleCheckoutCompleted(data);
        break;
      }
      case "subscription.created":
      case "subscription.updated": {
        await handleSubscriptionUpdated(data);
        break;
      }
      case "subscription.canceled": {
        await handleSubscriptionCanceled(data);
        break;
      }
      case "customer.created":
      case "customer.updated": {
        await handleCustomerUpdated(data);
        break;
      }
      default:
        logger.info("Unhandled webhook event type", { type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Error processing webhook", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.completed event
 */
async function handleCheckoutCompleted(data: any) {
  const { customerId, customerEmail, customerExternalId, metadata } = data;

  if (!customerExternalId && !metadata?.userId) {
    logger.warn("Checkout completed without user identifier", {
      customerId,
    });
    return;
  }

  const userId = customerExternalId || metadata?.userId;

  // Find or create customer record
  const existingCustomer = await db.query.polarCustomers.findFirst({
    where: eq(polarCustomers.polarCustomerId, customerId),
  });

  if (!existingCustomer) {
    // Create customer record if it doesn't exist
    await db.insert(polarCustomers).values({
      userId,
      polarCustomerId: customerId,
      email: customerEmail || "",
    });
  }
}

/**
 * Handle subscription.created and subscription.updated events
 */
async function handleSubscriptionUpdated(data: any) {
  const {
    id: subscriptionId,
    customerId,
    status,
    productId,
    productPriceId,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    customerExternalId,
  } = data;

  // Find customer by Polar customer ID
  const customer = await db.query.polarCustomers.findFirst({
    where: eq(polarCustomers.polarCustomerId, customerId),
  });

  if (!customer) {
    logger.warn("Subscription updated for unknown customer", {
      subscriptionId,
      customerId,
    });
    return;
  }

  // Check if subscription already exists
  const existingSubscription = await db.query.polarSubscriptions.findFirst({
    where: eq(polarSubscriptions.polarSubscriptionId, subscriptionId),
  });

  const subscriptionData = {
    userId: customer.userId,
    polarCustomerId: customerId,
    polarSubscriptionId: subscriptionId,
    status,
    productId: productId || null,
    productPriceId: productPriceId || null,
    currentPeriodEnd: currentPeriodEnd
      ? new Date(currentPeriodEnd)
      : null,
    cancelAtPeriodEnd: cancelAtPeriodEnd || false,
    updatedAt: new Date(),
  };

  if (existingSubscription) {
    // Update existing subscription
    await db
      .update(polarSubscriptions)
      .set(subscriptionData)
      .where(eq(polarSubscriptions.id, existingSubscription.id));
  } else {
    // Create new subscription
    await db.insert(polarSubscriptions).values({
      ...subscriptionData,
      createdAt: new Date(),
    });
  }

  logger.info("Subscription updated", {
    subscriptionId,
    userId: customer.userId,
    status,
  });
}

/**
 * Handle subscription.canceled event
 */
async function handleSubscriptionCanceled(data: any) {
  const { id: subscriptionId } = data;

  const subscription = await db.query.polarSubscriptions.findFirst({
    where: eq(polarSubscriptions.polarSubscriptionId, subscriptionId),
  });

  if (subscription) {
    await db
      .update(polarSubscriptions)
      .set({
        status: "canceled",
        updatedAt: new Date(),
      })
      .where(eq(polarSubscriptions.id, subscription.id));

    logger.info("Subscription canceled", {
      subscriptionId,
      userId: subscription.userId,
    });
  }
}

/**
 * Handle customer.created and customer.updated events
 */
async function handleCustomerUpdated(data: any) {
  const { id: customerId, email, externalId } = data;

  if (!externalId) {
    logger.warn("Customer updated without external ID", { customerId });
    return;
  }

  const existingCustomer = await db.query.polarCustomers.findFirst({
    where: eq(polarCustomers.polarCustomerId, customerId),
  });

  if (existingCustomer) {
    // Update existing customer
    await db
      .update(polarCustomers)
      .set({
        email: email || existingCustomer.email,
        updatedAt: new Date(),
      })
      .where(eq(polarCustomers.id, existingCustomer.id));
  } else {
    // Create new customer
    await db.insert(polarCustomers).values({
      userId: externalId,
      polarCustomerId: customerId,
      email: email || "",
    });
  }
}
