import { createServer, Server } from "http";
import { config } from "./config";
import { createApp } from "./app";
import { CoinGeckoProvider } from "./providers/coingecko-provider";
import { BitcoinPriceService } from "./services/bitcoin-price-service";
import { RollingAverageService } from "./services/rolling-average-service";

const provider = new CoinGeckoProvider();
const priceService = new BitcoinPriceService(provider, config.maxSamples);
const averageService = new RollingAverageService();

const app = createApp(priceService);
const server: Server = createServer(app);

let pollTimer: NodeJS.Timeout | null = null;
let averageTimer: NodeJS.Timeout | null = null;
let shuttingDown = false;

async function fetchPriceAndLog(): Promise<void> {
  try {
    const sample = await priceService.fetchAndStorePrice();
    console.log(
      `[service-a] fetched bitcoin price: $${sample.valueUsd.toFixed(2)} at ${sample.timestamp}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[service-a] failed to fetch bitcoin price: ${message}`);
  }
}

function logRollingAverage(): void {
  const samples = priceService.getSamples();
  const average = averageService.calculateAverage(samples);

  if (average === null) {
    console.log("[service-a] no samples available yet for average calculation");
    return;
  }

  console.log(
    `[service-a] rolling average for last ${samples.length} sample(s): $${average.toFixed(2)}`,
  );
}

async function startBackgroundJobs(): Promise<void> {
  await fetchPriceAndLog();

  pollTimer = setInterval(() => {
    void fetchPriceAndLog();
  }, config.pollIntervalMs);

  averageTimer = setInterval(() => {
    logRollingAverage();
  }, config.averageIntervalMs);
}

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`[service-a] received ${signal}, shutting down gracefully`);

  if (pollTimer) {
    clearInterval(pollTimer);
  }

  if (averageTimer) {
    clearInterval(averageTimer);
  }

  server.close((error?: Error) => {
    if (error) {
      console.error(`[service-a] error while closing server: ${error.message}`);
      process.exit(1);
    }

    console.log("[service-a] shutdown complete");
    process.exit(0);
  });
}

async function bootstrap(): Promise<void> {
  server.listen(config.port, () => {
    console.log(`[service-a] server started on port ${config.port}`);
  });

  await startBackgroundJobs();
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
  console.error(`[service-a] failed to start: ${message}`);
  process.exit(1);
});
