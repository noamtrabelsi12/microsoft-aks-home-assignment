import { PriceSample } from "../types";

export class RollingAverageService {
  public calculateAverage(samples: PriceSample[]): number | null {
    if (samples.length === 0) {
      return null;
    }

    const total = samples.reduce((sum, sample) => sum + sample.valueUsd, 0);
    return total / samples.length;
  }
}
