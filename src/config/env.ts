import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const isTest = process.env.NODE_ENV === "test";

if (isTest) {
  process.env.JWT_SECRET ??= "test-jwt-secret";
  process.env.LOG_LEVEL ??= "silent";
}

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  LOG_LEVEL: z.string().default("info"),

  DB_HOST: z.string().min(1, "DB_HOST is required"),
  DB_PORT: z.coerce
    .number()
    .int()
    .positive("DB_PORT must be a positive number"),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_NAME: z.string().min(1, "DB_NAME is required"),
  DB_SSL_CA_PATH: z.string().optional(),

  CORS_ORIGIN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `Invalid environment configuration. Check your .env file:\n${issues}`,
  );
}

export const env = {
  ...parsed.data,
  CORS_ORIGIN: parsed.data.CORS_ORIGIN
    ? parsed.data.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : [],
};
