"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { fetchSubscriptionStatus } from "@/lib/api/subscriptions";
import { logger } from "@/lib/logger";

interface SubscriptionStatusProps {
  className?: string;
}

interface SubscriptionData {
  hasActiveSubscription: boolean;
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export function SubscriptionStatus({ className = "" }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await fetchSubscriptionStatus();
        setSubscription(data);
      } catch (error) {
        logger.error(
          "Failed to fetch subscription status",
          error instanceof Error ? error : undefined
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const { hasActiveSubscription, subscription: sub } = subscription;

  if (!hasActiveSubscription) {
    return (
      <div className={`bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-600 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Subscription Required
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Subscribe to unlock PDF downloads and premium features.
            </p>
            <a
              href="/dashboard?subscription=required"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#DB4B2E] hover:underline transition-colors"
            >
              View Plans →
            </a>
          </div>
        </div>
      </div>
    );
  }

  const periodEnd = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd)
    : null;
  const isCanceled = sub?.cancelAtPeriodEnd;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {isCanceled ? (
          <Clock className="text-amber-600 mt-0.5" size={20} />
        ) : (
          <CheckCircle2 className="text-green-600 mt-0.5" size={20} />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">
              {isCanceled ? "Subscription Active (Canceling)" : "Active Subscription"}
            </h3>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
              {sub?.status || "active"}
            </span>
          </div>
          {periodEnd && (
            <p className="text-sm text-gray-600">
              {isCanceled
                ? `Access until ${periodEnd.toLocaleDateString()}`
                : `Renews on ${periodEnd.toLocaleDateString()}`}
            </p>
          )}
          {isCanceled && (
            <p className="text-xs text-amber-600 mt-2">
              Your subscription will end on {periodEnd?.toLocaleDateString()}. 
              You can reactivate anytime.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
