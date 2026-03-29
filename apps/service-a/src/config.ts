function getNumberEnv(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (!raw) return defaultValue;

  const parsed = Number(raw);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric env var: ${name}=${raw}`);
  }

  return parsed;
}

export const config = {
  port: getNumberEnv("PORT", 3000),
  pollIntervalMs: getNumberEnv("BTC_POLL_INTERVAL_MS", 60_000),
  averageIntervalMs: getNumberEnv("BTC_AVERAGE_INTERVAL_MS", 600_000),
  maxSamples: getNumberEnv("BTC_MAX_SAMPLES", 10),
  requestTimeoutMs: getNumberEnv("BTC_REQUEST_TIMEOUT_MS", 10_000),
};
