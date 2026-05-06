import type { IncomingHttpHeaders } from "node:http";

interface RateLimitStoreEntry {
  count: number;
  resetTime: number;
}

const store: Record<string, RateLimitStoreEntry> = {};

export interface BackendRateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export interface BackendRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export const backendRateLimitConfigs = {
  upload: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  },
};

export function getBackendClientIdentifier(
  headers: Headers | IncomingHttpHeaders
): string {
  const forwardedFor =
    headers instanceof Headers
      ? headers.get("x-forwarded-for")
      : typeof headers["x-forwarded-for"] === "string"
        ? headers["x-forwarded-for"]
        : headers["x-forwarded-for"]?.[0];
  const realIp =
    headers instanceof Headers
      ? headers.get("x-real-ip")
      : typeof headers["x-real-ip"] === "string"
        ? headers["x-real-ip"]
        : headers["x-real-ip"]?.[0];
  const ip = forwardedFor?.split(",")[0] || realIp || "unknown";

  return ip.trim();
}

export function checkBackendRateLimit(
  identifier: string,
  options: BackendRateLimitOptions
): BackendRateLimitResult {
  const now = Date.now();
  const entry = store[identifier];

  if (!entry || entry.resetTime < now) {
    store[identifier] = {
      count: 1,
      resetTime: now + options.windowMs,
    };

    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    };
  }

  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count += 1;

  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}
