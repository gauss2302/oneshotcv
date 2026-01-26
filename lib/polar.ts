import { Polar } from "@polar-sh/sdk";
import { getEnvVar } from "./env-validation";

let polarClient: Polar | null = null;

/**
 * Get or create Polar client instance
 */
export function getPolarClient(): Polar | null {
  const accessToken = getEnvVar("POLAR_ACCESS_TOKEN");
  
  if (!accessToken) {
    if (process.env.NODE_ENV === "development") {
      console.warn("POLAR_ACCESS_TOKEN is not set. Polar features will be disabled.");
    }
    return null;
  }

  if (!polarClient) {
    polarClient = new Polar({
      accessToken,
    });
  }

  return polarClient;
}

/**
 * Check if Polar is configured
 */
export function isPolarConfigured(): boolean {
  return !!getEnvVar("POLAR_ACCESS_TOKEN");
}
