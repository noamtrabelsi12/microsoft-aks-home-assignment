import express from "express";
import { BitcoinPriceService } from "./services/bitcoin-price-service";
import { createHealthRouter } from "./routes/health";

export function createApp(priceService: BitcoinPriceService) {
  const app = express();

  app.use(express.json());
  app.use(createHealthRouter(priceService));

  app.get("/", (_req, res) => {
    res.status(200).json({
      service: "service-a",
      message: "Bitcoin polling service is running",
    });
  });

  app.get("/stats", (_req, res) => {
    res.status(200).json({
      service: "service-a",
      ready: priceService.isReady(),
      lastSuccessfulFetchAt: priceService.getLastSuccessfulFetchAt(),
      samples: priceService.getSamples(),
    });
  });

  return app;
}
