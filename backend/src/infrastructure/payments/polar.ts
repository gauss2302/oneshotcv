import { Polar } from "@polar-sh/sdk";

import { getBackendEnv } from "@/config/env";

let polarClient: Polar | null = null;

export function isBackendPolarConfigured(): boolean {
  return Boolean(getBackendEnv().POLAR_ACCESS_TOKEN);
}

export function getBackendPolarClient(): Polar | null {
  const env = getBackendEnv();
  if (!env.POLAR_ACCESS_TOKEN) {
    return null;
  }

  if (!polarClient) {
    polarClient = new Polar({
      accessToken: env.POLAR_ACCESS_TOKEN,
    });
  }

  return polarClient;
}
