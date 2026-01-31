/**
 * Runs Drizzle migrations against DATABASE_URL.
 * Used at container startup so the production DB has auth tables (user, session, account, verification).
 */
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Skipping migrations.");
    process.exit(0);
  }

  const pool = new pg.Pool({ connectionString: url });
  const db = drizzle(pool);

  try {
    await migrate(db, {
      migrationsFolder: path.join(__dirname, "..", "drizzle"),
    });
    console.log("Migrations completed.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
