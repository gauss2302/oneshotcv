import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance

const isProduction = process.env.NODE_ENV === "production";
const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const productionDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN;

// Build trusted origins array
const trustedOrigins: string[] = [baseURL];
if (productionDomain) {
  trustedOrigins.push(`https://${productionDomain}`);
  // Also add without protocol if needed
  if (!productionDomain.startsWith("http")) {
    trustedOrigins.push(`https://${productionDomain}`);
  }
}

export const auth = betterAuth({
    baseURL,
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            enabled: true,
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
         github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
         linkedin: {
            enabled: true,
            clientId: process.env.LINKEDIN_CLIENT_ID as string,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
        },
    },
    trustedOrigins,
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
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
});