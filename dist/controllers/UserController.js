"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserService_1 = require("../services/UserService");
const UserRepository_1 = require("../repositories/UserRepository");
const userValidator_1 = require("../validators/userValidator");
const repository = new UserRepository_1.UserRepository();
const service = new UserService_1.UserService(repository);
class UserController {
    static async getUsers(req, res, next) {
        try {
            const users = await service.getUsers();
            res.json(users);
        }
        catch (error) {
            next(error);
        }
    }
    static async createUser(req, res, next) {
        try {
            const dto = userValidator_1.createUserSchema.parse(req.body);
            const user = await service.createUser(dto.name);
            res.status(201).json(user);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UserController = UserController;
