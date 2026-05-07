import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";

import { subscriptionRepository } from "./repository";

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

export function parsePolarWebhookEvent(
  body: string,
  headers: Record<string, string>,
  secret: string
): PolarWebhookEvent {
  return validateEvent(body, headers, secret);
}

export function isPolarWebhookVerificationError(
  error: unknown
): error is WebhookVerificationError {
  return error instanceof WebhookVerificationError;
}

export async function handlePolarWebhookEvent(event: PolarWebhookEvent) {
  switch (event.type) {
    case "checkout.created":
    case "checkout.updated":
      await handleCheckoutEvent(event.data);
      return;
    case "subscription.active":
    case "subscription.created":
    case "subscription.updated":
      await upsertSubscription(event.data);
      return;
    case "subscription.canceled":
      await upsertSubscription(event.data, "canceled");
      return;
    case "customer.created":
    case "customer.updated":
      await handleCustomerUpdated(event.data);
      return;
    default:
      return;
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
    return;
  }

  await ensureCustomerExists(
    customerId,
    userId,
    normalizeString(data.customerEmail) ?? ""
  );
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
    return;
  }

  const existingSubscription = await subscriptionRepository.findSubscriptionByPolarId(
    data.id
  );
  const firstPrice = data.prices[0];

  await subscriptionRepository.upsertSubscription({
    id: existingSubscription?.id,
    userId: customer.userId,
    polarCustomerId: customerId,
    polarSubscriptionId: data.id,
    status: statusOverride ?? data.status,
    productId: data.productId || null,
    productPriceId: firstPrice?.id ?? null,
    currentPeriodEnd: data.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
  });
}

async function handleCustomerUpdated(data: CustomerEvent["data"]) {
  const customerId = data.id;
  const email = normalizeString(data.email) ?? "";
  const externalId = normalizeString(data.externalId);

  if (!externalId) {
    return;
  }

  const existingUser = await subscriptionRepository.findUserById(externalId);
  if (!existingUser) {
    return;
  }

  const existingCustomer = await subscriptionRepository.findCustomerByPolarId(
    customerId
  );
  await subscriptionRepository.upsertCustomer({
    id: existingCustomer?.id,
    userId: externalId,
    polarCustomerId: customerId,
    email: email || existingCustomer?.email || "",
  });
}

async function ensureCustomerExists(
  customerId: string,
  userId: string | null,
  email: string | null
) {
  const existingCustomer = await subscriptionRepository.findCustomerByPolarId(
    customerId
  );

  if (existingCustomer) {
    if (email && email !== existingCustomer.email) {
      await subscriptionRepository.upsertCustomer({
        id: existingCustomer.id,
        userId: existingCustomer.userId,
        polarCustomerId: customerId,
        email,
      });

      return { ...existingCustomer, email };
    }

    return existingCustomer;
  }

  if (!userId) {
    return null;
  }

  const existingUser = await subscriptionRepository.findUserById(userId);
  if (!existingUser) {
    return null;
  }

  const existingCustomerForUser = await subscriptionRepository.findCustomerByUserId(
    userId
  );
  const nextEmail = email ?? existingCustomerForUser?.email ?? "";

  await subscriptionRepository.upsertCustomer({
    id: existingCustomerForUser?.id,
    userId,
    polarCustomerId: customerId,
    email: nextEmail,
  });

  return subscriptionRepository.findCustomerByPolarId(customerId);
}

function getCheckoutUserId(data: CheckoutEvent["data"]): string | null {
  const externalId =
    normalizeString(data.externalCustomerId)
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
