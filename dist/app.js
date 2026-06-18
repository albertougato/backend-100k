"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
app.use("/users", userRoutes_1.default);
const errorHandler_1 = require("./middlewares/errorHandler");
app.use(errorHandler_1.errorHandler);
exports.default = app;
