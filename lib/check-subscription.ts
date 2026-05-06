import { fetchSubscriptionStatus } from "@/lib/api/subscriptions";

/**
 * Client-side utility to check subscription status
 */
export async function checkSubscriptionStatus() {
  return fetchSubscriptionStatus();
}
