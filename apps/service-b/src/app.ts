import express from "express";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/", (_req, res) => {
    res.status(200).json({
      service: "service-b",
      status: "ok",
      message: "Service B is running",
    });
  });

  app.get("/healthz", (_req, res) => {
    res.status(200).json({
      service: "service-b",
      status: "ok",
    });
  });

  app.get("/readyz", (_req, res) => {
    res.status(200).json({
      service: "service-b",
      status: "ready",
    });
  });

  return app;
}
