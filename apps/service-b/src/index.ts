import { createServer, Server } from "http";
import { config } from "./config";
import { createApp } from "./app";

const app = createApp();
const server: Server = createServer(app);

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`[service-b] received ${signal}, shutting down gracefully`);

  server.close((error?: Error) => {
    if (error) {
      console.error(`[service-b] error while closing server: ${error.message}`);
      process.exit(1);
    }

    console.log("[service-b] shutdown complete");
    process.exit(0);
  });
}

async function bootstrap(): Promise<void> {
  server.listen(config.port, () => {
    console.log(`[service-b] server started on port ${config.port}`);
  });
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

void bootstrap().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Unknown bootstrap error";
  console.error(`[service-b] failed to start: ${message}`);
  process.exit(1);
});
