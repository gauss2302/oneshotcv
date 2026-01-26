/**
 * Client-side utility to check subscription status
 */
export async function checkSubscriptionStatus(): Promise<{
  hasActiveSubscription: boolean;
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}> {
  const response = await fetch("/api/subscription/status", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to check subscription status");
  }

  return response.json();
}
