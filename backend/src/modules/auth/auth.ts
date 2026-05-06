import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/infrastructure/db/client";
import { getAuthBaseUrl, getTrustedOrigins } from "@/config/env";

const isProduction = process.env.NODE_ENV === "production";
const authBaseUrl = getAuthBaseUrl();

const socialProviders = {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          enabled: true,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          redirectURI: `${authBaseUrl}/api/auth/callback/google`,
        },
      }
    : {}),
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET
    ? {
        linkedin: {
          enabled: true,
          clientId: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
          redirectURI: `${authBaseUrl}/api/auth/callback/linkedin`,
        },
      }
    : {}),
};

export const backendAuth = betterAuth({
  baseURL: authBaseUrl,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders,
  trustedOrigins: getTrustedOrigins(),
  advanced: {
    useSecureCookies: isProduction,
    disableCSRFCheck: false,
    disableOriginCheck: false,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
    },
    cookies: {
      session_token: {
        attributes: {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax" as const,
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});
