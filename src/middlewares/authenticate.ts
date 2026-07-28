import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { BusinessError } from "../errors/BusinessError";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authorization = req.header("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : undefined;

    if (!token || !env.JWT_SECRET) {
      throw new BusinessError("Authentication required", 401);
    }

    const payload = jwt.verify(token, env.JWT_SECRET);

    if (typeof payload === "string" || !isValidPayload(payload)) {
      throw new BusinessError("Authentication required", 401);
    }

    req.user = { id: Number(payload.sub) };
    next();
  } catch (error) {
    next(
      error instanceof BusinessError
        ? error
        : new BusinessError("Authentication required", 401),
    );
  }
}

function isValidPayload(payload: JwtPayload): boolean {
  const userId = Number(payload.sub);

  return Number.isInteger(userId) && userId > 0;
}
