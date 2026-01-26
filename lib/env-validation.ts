import { z } from "zod";

// Environment variable schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // OAuth Providers (optional but validated if provided)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),

  // MinIO
  MINIO_ENDPOINT: z.string().min(1, "MINIO_ENDPOINT is required"),
  MINIO_PORT: z.string().regex(/^\d+$/, "MINIO_PORT must be a number"),
  MINIO_ACCESS_KEY: z.string().min(1, "MINIO_ACCESS_KEY is required"),
  MINIO_SECRET_KEY: z.string().min(1, "MINIO_SECRET_KEY is required"),
  MINIO_USE_SSL: z.string().optional(),
  MINIO_BUCKET_NAME: z.string().min(1, "MINIO_BUCKET_NAME is required"),
  NEXT_PUBLIC_MINIO_PUBLIC_URL: z.string().url("NEXT_PUBLIC_MINIO_PUBLIC_URL must be a valid URL"),

  // Production domain (optional)
  NEXT_PUBLIC_PRODUCTION_DOMAIN: z.string().optional(),

  // Polar
  POLAR_ACCESS_TOKEN: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  POLAR_ORGANIZATION_ID: z.string().optional(),
  POLAR_PRODUCT_PRICE_ID: z.string().optional(),
});

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Validates and returns environment variables
 * Fails fast if critical variables are missing or invalid
 */
export function getEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors.map((err) => {
      return `${err.path.join(".")}: ${err.message}`;
    });

    throw new Error(
      `Environment variable validation failed:\n${errors.join("\n")}\n\n` +
        "Please check your .env file and ensure all required variables are set."
    );
  }

  validatedEnv = result.data;
  return validatedEnv;
}

/**
 * Get a specific environment variable with type safety
 */
export function getEnvVar<K extends keyof Env>(key: K): Env[K] {
  const env = getEnv();
  return env[key];
}

// Validate on module load in production
if (process.env.NODE_ENV === "production") {
  try {
    getEnv();
  } catch (error) {
    console.error("FATAL: Environment validation failed on startup");
    console.error(error);
    process.exit(1);
  }
}
