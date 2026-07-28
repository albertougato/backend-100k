import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.get("/", UserController.getUsers);
router.post("/", authenticate, UserController.createUser);
router.put("/:id", authenticate, UserController.updateUser);
router.delete("/:id", authenticate, UserController.deleteUser);

export default router;
