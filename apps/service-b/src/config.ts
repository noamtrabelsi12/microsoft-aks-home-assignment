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
};
