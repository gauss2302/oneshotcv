import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { polarCustomers, polarSubscriptions, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getEnvVar } from "@/lib/env-validation";
import { logger } from "@/lib/logger";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";

type PolarWebhookEvent = ReturnType<typeof validateEvent>;
type CheckoutEvent = Extract<
  PolarWebhookEvent,
  { type: "checkout.created" | "checkout.updated" }
>;
type SubscriptionEvent = Extract<
  PolarWebhookEvent,
  {
    type:
      | "subscription.active"
      | "subscription.created"
      | "subscription.updated"
      | "subscription.canceled";
  }
>;
type CustomerEvent = Extract<
  PolarWebhookEvent,
  { type: "customer.created" | "customer.updated" }
>;

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

    const body = await req.text();
    const headersMap = Object.fromEntries(req.headers.entries());

    let event: PolarWebhookEvent;
    try {
      event = validateEvent(body, headersMap, webhookSecret);
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        logger.warn("Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
      throw error;
    }

    logger.info("Received Polar webhook", {
      type: event.type,
      eventId: event.data?.id,
    });

    switch (event.type) {
      case "checkout.created":
      case "checkout.updated": {
        await handleCheckoutEvent(event.data);
        break;
      }
      case "subscription.active":
      case "subscription.created":
      case "subscription.updated": {
        await upsertSubscription(event.data);
        break;
      }
      case "subscription.canceled": {
        await upsertSubscription(event.data, "canceled");
        break;
      }
      case "customer.created":
      case "customer.updated": {
        await handleCustomerUpdated(event.data);
        break;
      }
      default:
        logger.info("Unhandled webhook event type", { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error(
      "Error processing webhook",
      error instanceof Error ? error : undefined
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleCheckoutEvent(data: CheckoutEvent["data"]) {
  const customerId = data.customerId;
  if (!customerId) {
    return;
  }

  if (data.status !== "confirmed" && data.status !== "succeeded") {
    return;
  }

  const userId = getCheckoutUserId(data);
  if (!userId) {
    logger.warn("Checkout completed without user identifier", {
      checkoutId: data.id,
      customerId,
    });
    return;
  }

  const customer = await ensureCustomerExists(
    customerId,
    userId,
    normalizeString(data.customerEmail) ?? ""
  );

  if (!customer) {
    return;
  }
}

async function upsertSubscription(
  data: SubscriptionEvent["data"],
  statusOverride?: string
) {
  const customerId = data.customerId;
  const customerEmail = data.customer.email;
  const fallbackUserId = normalizeString(data.customer.externalId);

  const customer = await ensureCustomerExists(
    customerId,
    fallbackUserId,
    customerEmail
  );

  if (!customer) {
    logger.warn("Subscription updated for unknown customer", {
      subscriptionId: data.id,
      customerId,
    });
    return;
  }

  const existingSubscription = await db.query.polarSubscriptions.findFirst({
    where: eq(polarSubscriptions.polarSubscriptionId, data.id),
  });

  const firstPrice = data.prices[0];
  const priceId = firstPrice?.id ?? null;

  const subscriptionData = {
    userId: customer.userId,
    polarCustomerId: customerId,
    polarSubscriptionId: data.id,
    status: statusOverride ?? data.status,
    productId: data.productId || null,
    productPriceId: priceId,
    currentPeriodEnd: data.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
    updatedAt: new Date(),
  };

  if (existingSubscription) {
    await db
      .update(polarSubscriptions)
      .set(subscriptionData)
      .where(eq(polarSubscriptions.id, existingSubscription.id));
  } else {
    await db.insert(polarSubscriptions).values({
      ...subscriptionData,
      createdAt: new Date(),
    });
  }

  logger.info("Subscription updated", {
    subscriptionId: data.id,
    userId: customer.userId,
    status: subscriptionData.status,
  });
}

async function handleCustomerUpdated(data: CustomerEvent["data"]) {
  const customerId = data.id;
  const email = normalizeString(data.email) ?? "";
  const externalId = normalizeString(data.externalId);

  if (!externalId) {
    logger.warn("Customer updated without external ID", { customerId });
    return;
  }

  const existingUser = await db.query.user.findFirst({
    where: eq(user.id, externalId),
  });
  if (!existingUser) {
    logger.warn("Customer mapped to unknown user", { customerId, externalId });
    return;
  }

  const existingCustomer = await db.query.polarCustomers.findFirst({
    where: eq(polarCustomers.polarCustomerId, customerId),
  });

  if (existingCustomer) {
    await db
      .update(polarCustomers)
      .set({
        email: email || existingCustomer.email,
        updatedAt: new Date(),
      })
      .where(eq(polarCustomers.id, existingCustomer.id));
  } else {
    await db.insert(polarCustomers).values({
      userId: externalId,
      polarCustomerId: customerId,
      email,
    });
  }
}

async function ensureCustomerExists(
  customerId: string,
  userId: string | null,
  email: string | null
) {
  const existingCustomer = await db.query.polarCustomers.findFirst({
    where: eq(polarCustomers.polarCustomerId, customerId),
  });

  if (existingCustomer) {
    if (email && email !== existingCustomer.email) {
      await db
        .update(polarCustomers)
        .set({
          email,
          updatedAt: new Date(),
        })
        .where(eq(polarCustomers.id, existingCustomer.id));

      return { ...existingCustomer, email };
    }
    return existingCustomer;
  }

  if (!userId) {
    return null;
  }

  const existingUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!existingUser) {
    logger.warn("Polar webhook user reference does not exist", {
      customerId,
      userId,
    });
    return null;
  }

  const existingCustomerForUser = await db.query.polarCustomers.findFirst({
    where: eq(polarCustomers.userId, userId),
  });

  if (existingCustomerForUser) {
    const nextEmail = email ?? existingCustomerForUser.email;

    if (
      existingCustomerForUser.polarCustomerId !== customerId
      || existingCustomerForUser.email !== nextEmail
    ) {
      await db
        .update(polarCustomers)
        .set({
          polarCustomerId: customerId,
          email: nextEmail,
          updatedAt: new Date(),
        })
        .where(eq(polarCustomers.id, existingCustomerForUser.id));

      return { ...existingCustomerForUser, polarCustomerId: customerId, email: nextEmail };
    }

    return existingCustomerForUser;
  }

  await db.insert(polarCustomers).values({
    userId,
    polarCustomerId: customerId,
    email: email ?? "",
  });

  return db.query.polarCustomers.findFirst({
    where: eq(polarCustomers.polarCustomerId, customerId),
  });
}

function getCheckoutUserId(data: CheckoutEvent["data"]): string | null {
  const externalId = normalizeString(data.externalCustomerId)
    ?? normalizeString(data.customerExternalId);
  if (externalId) {
    return externalId;
  }

  const metadataUserId = data.metadata.userId;
  if (typeof metadataUserId === "string" && metadataUserId.trim()) {
    return metadataUserId.trim();
  }

  return null;
}

function normalizeString(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}
