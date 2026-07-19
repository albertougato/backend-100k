import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { BusinessError } from "../errors/BusinessError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err);

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

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
