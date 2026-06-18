"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const router = (0, express_1.Router)();
router.get("/", UserController_1.UserController.getUsers);
router.post("/", UserController_1.UserController.createUser);
exports.default = router;
