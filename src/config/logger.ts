import pino from "pino";
import { env } from "./env";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: undefined,
  redact: {
    paths: [
      "password",
      "passwordHash",
      "req.headers.authorization",
      "req.body.password",
    ],
    censor: "[REDACTED]",
  },
});
