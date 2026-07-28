import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { BusinessError } from "../errors/BusinessError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error(
    {
      err,
      requestId: _req.requestId,
      method: _req.method,
      path: _req.path,
    },
    "request failed",
  );

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      errors: err.issues,
    });

    return;
  }

  if (err instanceof BusinessError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });

    return;
  }

  if (isPostgresUniqueViolation(err)) {
    res.status(409).json({
      success: false,
      message: "A user with these details already exists",
    });

    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

function isPostgresUniqueViolation(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
