import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(__dirname, "src"),
      "@contracts": path.join(__dirname, "../packages/contracts/src"),
    },
  },
  test: {
    environment: "node",
    include: ["backend/src/**/*.test.ts"],
    passWithNoTests: false,
  },
});
