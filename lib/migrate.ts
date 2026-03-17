import path from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

/**
 * Runs Drizzle migrations against DATABASE_URL.
 * Called from instrumentation.ts on server startup so the production DB
 * has auth tables (user, session, account, verification) without needing
 * a separate script or node_modules in the container.
 */
export async function runMigrations(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return;
  }

  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool);

  try {
    // In Docker standalone: cwd is /app, we copy drizzle to /app/drizzle
    const migrationsFolder = path.join(process.cwd(), "drizzle");
    await migrate(db, { migrationsFolder });
  } catch (error) {
    throw error;
  } finally {
    await pool.end();
  }
}
