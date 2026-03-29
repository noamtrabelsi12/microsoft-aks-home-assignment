export type PriceSample = {
  timestamp: string;
  valueUsd: number;
};

export interface BitcoinPriceProvider {
  getCurrentPriceUsd(): Promise<number>;
}
