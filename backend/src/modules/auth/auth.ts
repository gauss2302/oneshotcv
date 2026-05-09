import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/infrastructure/db/client";
import { getAuthBaseUrl, getBackendEnv, getTrustedOrigins } from "@/config/env";

const env = getBackendEnv();
const authBaseUrl = getAuthBaseUrl();
// Browsers reject `Secure` cookies on plain HTTP and Better Auth prefixes
// secure cookie names with `__Secure-`, which would also break the proxy
// middleware's cookie lookup. Gate on the actual scheme of the auth origin.
const useSecureCookies = authBaseUrl.startsWith("https://");

const socialProviders = {
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          enabled: true,
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          redirectURI: `${authBaseUrl}/api/auth/callback/google`,
        },
      }
    : {}),
  ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
  ...(env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET
    ? {
        linkedin: {
          enabled: true,
          clientId: env.LINKEDIN_CLIENT_ID,
          clientSecret: env.LINKEDIN_CLIENT_SECRET,
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
    useSecureCookies,
    disableCSRFCheck: false,
    disableOriginCheck: false,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: useSecureCookies,
      sameSite: "lax" as const,
    },
    cookies: {
      session_token: {
        attributes: {
          httpOnly: true,
          secure: useSecureCookies,
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
