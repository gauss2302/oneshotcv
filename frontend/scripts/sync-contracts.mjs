import { cpSync, existsSync, rmSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Frontend package root (…/frontend or /app in Docker). */
const packageRoot = resolve(__dirname, "..");
/** Canonical contracts when developing from monorepo checkout. */
const monorepoSource = resolve(packageRoot, "../backend/src/contracts");
const dest = resolve(packageRoot, "contracts");

if (existsSync(monorepoSource)) {
  rmSync(dest, { recursive: true, force: true });
  cpSync(monorepoSource, dest, { recursive: true });
  console.log(`sync-contracts: ${monorepoSource} -> ${dest}`);
  process.exit(0);
}

// Docker (and similar): frontend image copies backend contracts into /app/contracts — no sibling backend/.
if (existsSync(dest)) {
  console.log(`sync-contracts: keep existing ${dest} (no monorepo backend/src/contracts beside package)`);
  process.exit(0);
}

console.error(
  `sync-contracts: missing ${monorepoSource} and empty ${dest} (clone repo with backend or copy contracts into frontend/contracts)`,
);
process.exit(1);
