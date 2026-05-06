import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getBackendEnv } from "@/config/env";
import * as schema from "./schema";

const env = getBackendEnv();

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });

export async function checkBackendDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return true;
  } catch {
    return false;
  }
}

export async function closeDatabasePool(): Promise<void> {
  await pool.end();
}
