import { Pool } from "pg";
import { env } from "./env";
import { logger } from "./logger";

export const db = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

db.on("error", (err) => {
  logger.error({ err }, "unexpected error on idle database client");
});
