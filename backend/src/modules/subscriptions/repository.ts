import { and, eq, gt, isNull, or } from "drizzle-orm";

import { db } from "@/infrastructure/db/client";
import {
  polarCustomers,
  polarSubscriptions,
  user,
} from "@/infrastructure/db/schema";

export const subscriptionRepository = {
  findActiveSubscriptionForUser(userId: string) {
    return db.query.polarSubscriptions.findFirst({
      where: and(
        eq(polarSubscriptions.userId, userId),
        eq(polarSubscriptions.status, "active"),
        or(
          gt(polarSubscriptions.currentPeriodEnd, new Date()),
          isNull(polarSubscriptions.currentPeriodEnd)
        )
      ),
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    });
  },

  findSubscriptionByPolarId(subscriptionId: string) {
    return db.query.polarSubscriptions.findFirst({
      where: eq(polarSubscriptions.polarSubscriptionId, subscriptionId),
    });
  },

  findCustomerByPolarId(customerId: string) {
    return db.query.polarCustomers.findFirst({
      where: eq(polarCustomers.polarCustomerId, customerId),
    });
  },

  findCustomerByUserId(userId: string) {
    return db.query.polarCustomers.findFirst({
      where: eq(polarCustomers.userId, userId),
    });
  },

  findUserById(userId: string) {
    return db.query.user.findFirst({
      where: eq(user.id, userId),
    });
  },

  async upsertCustomer(data: {
    id?: string;
    userId: string;
    polarCustomerId: string;
    email: string;
  }) {
    if (data.id) {
      await db
        .update(polarCustomers)
        .set({
          polarCustomerId: data.polarCustomerId,
          email: data.email,
          updatedAt: new Date(),
        })
        .where(eq(polarCustomers.id, data.id));
      return;
    }

    await db.insert(polarCustomers).values({
      userId: data.userId,
      polarCustomerId: data.polarCustomerId,
      email: data.email,
    });
  },

  async upsertSubscription(data: {
    id?: string;
    userId: string;
    polarCustomerId: string;
    polarSubscriptionId: string;
    status: string;
    productId: string | null;
    productPriceId: string | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  }) {
    if (data.id) {
      await db
        .update(polarSubscriptions)
        .set({
          userId: data.userId,
          polarCustomerId: data.polarCustomerId,
          polarSubscriptionId: data.polarSubscriptionId,
          status: data.status,
          productId: data.productId,
          productPriceId: data.productPriceId,
          currentPeriodEnd: data.currentPeriodEnd,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd,
          updatedAt: new Date(),
        })
        .where(eq(polarSubscriptions.id, data.id));
      return;
    }

    await db.insert(polarSubscriptions).values({
      userId: data.userId,
      polarCustomerId: data.polarCustomerId,
      polarSubscriptionId: data.polarSubscriptionId,
      status: data.status,
      productId: data.productId,
      productPriceId: data.productPriceId,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },
};
