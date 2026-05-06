import { z } from "zod";

const backendEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  HOST: z.string().min(1).default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000"),
  AUTH_PUBLIC_URL: z.string().url().optional(),
  INDEPENDENT_BACKEND_URL: z.string().url().default("http://localhost:4000"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  MINIO_ENDPOINT: z.string().optional(),
  MINIO_PORT: z.coerce.number().int().positive().optional(),
  MINIO_USE_SSL: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  MINIO_ACCESS_KEY: z.string().optional(),
  MINIO_SECRET_KEY: z.string().optional(),
  MINIO_BUCKET_NAME: z.string().optional(),
  NEXT_PUBLIC_MINIO_PUBLIC_URL: z.string().url().optional(),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;

let cachedEnv: BackendEnv | null = null;

export function getBackendEnv(): BackendEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsedEnv = backendEnvSchema.safeParse(process.env);
  if (!parsedEnv.success) {
    const issues = parsedEnv.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Backend environment validation failed:\n${issues}`);
  }

  cachedEnv = parsedEnv.data;
  return cachedEnv;
}

export function getAuthBaseUrl(): string {
  const env = getBackendEnv();
  return env.AUTH_PUBLIC_URL ?? env.FRONTEND_ORIGIN;
}

export function getTrustedOrigins(): string[] {
  const env = getBackendEnv();
  return Array.from(new Set([env.FRONTEND_ORIGIN, getAuthBaseUrl()]));
}
