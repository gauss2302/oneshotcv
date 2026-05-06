import { buildBackendApp } from "./app";
import { getBackendEnv } from "./config/env";

async function start(): Promise<void> {
  const env = getBackendEnv();
  const app = await buildBackendApp();

  try {
    await app.listen({
      host: env.HOST,
      port: env.PORT,
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

void start();
