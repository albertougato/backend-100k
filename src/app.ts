import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { requestLogger } from "./middlewares/requestLogger";

const app = express();

app.use(helmet());

if (env.CORS_ORIGIN.length > 0) {
  app.use(cors({ origin: env.CORS_ORIGIN }));
}

app.use(express.json());
app.use(requestLogger);

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", version: process.env.APP_VERSION ?? "dev" });
});

import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";

app.use("/users", userRoutes);
app.use("/auth", authRoutes);

import { errorHandler } from "./middlewares/errorHandler";

app.use(errorHandler);

export default app;
