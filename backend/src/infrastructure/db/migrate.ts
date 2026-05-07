import path from "path";
import { fileURLToPath } from "url";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { getBackendEnv } from "@/config/env";

export async function runBackendMigrations(): Promise<void> {
  const env = getBackendEnv();
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 10000,
  });
  const database = drizzle(pool);
  const migrationsFolder = path.join(process.cwd(), "migrations");

  try {
    console.info(`Running database migrations from ${migrationsFolder}`);
    await migrate(database, { migrationsFolder });
    console.info("Database migrations completed successfully");
  } finally {
    await pool.end();
  }
}

function isExecutedDirectly(): boolean {
  const currentFilePath = fileURLToPath(import.meta.url);
  const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";

  return currentFilePath === executedPath;
}

if (isExecutedDirectly()) {
  runBackendMigrations().catch((error: unknown) => {
    console.error("Database migration failed", error);
    process.exit(1);
  });
}
