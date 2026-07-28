import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticate } from "../middlewares/authenticate";
import { authRateLimiter } from "../middlewares/authRateLimiter";

const router = Router();

router.post("/register", authRateLimiter, AuthController.register);
router.post("/login", authRateLimiter, AuthController.login);
router.get("/me", authenticate, AuthController.me);

export default router;
