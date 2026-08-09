import { readFileSync } from "fs";
import { Pool } from "pg";
import { env } from "./env";
import { logger } from "./logger";

export const db = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl: env.DB_SSL_CA_PATH
    ? {
        ca: readFileSync(env.DB_SSL_CA_PATH, "utf8"),
        rejectUnauthorized: true,
        servername: process.env.DB_SSL_SERVERNAME || env.DB_HOST,
      }
    : undefined,
});

db.on("error", (err) => {
  logger.error({ err }, "unexpected error on idle database client");
});
