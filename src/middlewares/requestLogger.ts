import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = randomUUID();
  const startedAt = process.hrtime.bigint();

  req.requestId = requestId;

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logger.info(
      {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      },
      "request completed",
    );
  });

  next();
}
