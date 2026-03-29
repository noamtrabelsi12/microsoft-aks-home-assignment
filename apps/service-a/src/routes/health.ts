import { Router } from "express";
import { BitcoinPriceService } from "../services/bitcoin-price-service";

export function createHealthRouter(priceService: BitcoinPriceService): Router {
  const router = Router();

  router.get("/healthz", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "service-a",
    });
  });

  router.get("/readyz", (_req, res) => {
    if (!priceService.isReady()) {
      return res.status(503).json({
        status: "not-ready",
        service: "service-a",
      });
    }

    return res.status(200).json({
      status: "ready",
      service: "service-a",
      lastSuccessfulFetchAt: priceService.getLastSuccessfulFetchAt(),
    });
  });

  return router;
}
