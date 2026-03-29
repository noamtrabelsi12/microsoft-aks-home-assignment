import { BitcoinPriceProvider, PriceSample } from "../types";

export class BitcoinPriceService {
  private readonly samples: PriceSample[] = [];
  private ready = false;
  private lastSuccessfulFetchAt: string | null = null;

  constructor(
    private readonly provider: BitcoinPriceProvider,
    private readonly maxSamples: number,
  ) {}

  public isReady(): boolean {
    return this.ready;
  }

  public getSamples(): PriceSample[] {
    return [...this.samples];
  }

  public getLastSuccessfulFetchAt(): string | null {
    return this.lastSuccessfulFetchAt;
  }

  public async fetchAndStorePrice(): Promise<PriceSample> {
    const valueUsd = await this.provider.getCurrentPriceUsd();

    const sample: PriceSample = {
      timestamp: new Date().toISOString(),
      valueUsd,
    };

    this.samples.push(sample);

    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }

    this.ready = true;
    this.lastSuccessfulFetchAt = sample.timestamp;

    return sample;
  }
}
