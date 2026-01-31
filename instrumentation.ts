/**
 * Next.js instrumentation hook — runs once when the Node.js server starts.
 * We run DB migrations here so the production container uses the same
 * bundled deps (drizzle-orm, pg) as the app instead of a separate script.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { runMigrations } = await import("./lib/migrate");
  await runMigrations();
}
