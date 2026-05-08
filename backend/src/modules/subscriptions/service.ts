import type { SubscriptionStatusResponse } from "@/contracts/subscription";

import { getBackendEnv } from "@/config/env";
import {
  getBackendPolarClient,
  isBackendPolarConfigured,
} from "@/infrastructure/payments/polar";

import {
  PaymentSystemNotConfiguredError,
  PaymentSystemUnavailableError,
  SubscriptionProductMissingError,
} from "./errors";
import { subscriptionRepository } from "./repository";

export const subscriptionService = {
  async getStatus(userId: string): Promise<SubscriptionStatusResponse> {
    const activeSubscription =
      await subscriptionRepository.findActiveSubscriptionForUser(userId);

    return {
      hasActiveSubscription: Boolean(activeSubscription),
      subscription: activeSubscription
        ? {
            id: activeSubscription.id,
            status: activeSubscription.status,
            currentPeriodEnd:
              activeSubscription.currentPeriodEnd?.toISOString() ?? null,
            cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
          }
        : null,
    };
  },

  async createCheckoutSession(user: {
    id: string;
    email: string;
    name?: string | null;
  }) {
    if (!isBackendPolarConfigured()) {
      throw new PaymentSystemNotConfiguredError();
    }

    const polar = getBackendPolarClient();
    if (!polar) {
      throw new PaymentSystemUnavailableError();
    }

    const env = getBackendEnv();
    if (!env.POLAR_PRODUCT_PRICE_ID) {
      throw new SubscriptionProductMissingError();
    }

    const successBaseUrl = env.NEXT_PUBLIC_APP_URL ?? env.FRONTEND_ORIGIN;
    const successUrl = `${successBaseUrl}/dashboard?subscription=success`;

    const checkout = await polar.checkouts.create({
      products: [env.POLAR_PRODUCT_PRICE_ID],
      successUrl,
      customerEmail: user.email,
      customerName: user.name || undefined,
      metadata: {
        userId: user.id,
        userEmail: user.email,
      },
    });

    return {
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
    };
  },
};
