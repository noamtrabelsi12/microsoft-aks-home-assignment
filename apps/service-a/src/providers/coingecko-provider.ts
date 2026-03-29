import { BitcoinPriceProvider } from "../types";
import { config } from "../config";

type CoinGeckoResponse = {
  bitcoin?: {
    usd?: number;
  };
};

export class CoinGeckoProvider implements BitcoinPriceProvider {
  async getCurrentPriceUsd(): Promise<number> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      config.requestTimeoutMs,
    );

    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
        {
          method: "GET",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`CoinGecko responded with status ${response.status}`);
      }

      const data = (await response.json()) as CoinGeckoResponse;
      const price = data.bitcoin?.usd;

      if (typeof price !== "number") {
        throw new Error("Invalid CoinGecko response: missing bitcoin.usd");
      }

      return price;
    } finally {
      clearTimeout(timeout);
    }
  }
}
