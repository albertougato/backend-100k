import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

import userRoutes from "./routes/userRoutes";

app.use("/users", userRoutes);

import { errorHandler } from "./middlewares/errorHandler";

app.use(errorHandler);

export default app;