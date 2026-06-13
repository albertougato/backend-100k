"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserService_1 = require("../services/UserService");
const UserRepository_1 = require("../repositories/UserRepository");
const repository = new UserRepository_1.UserRepository();
const service = new UserService_1.UserService(repository);
class UserController {
    static getUsers(req, res) {
        const users = service.getUsers();
        res.json(users);
    }
}
exports.UserController = UserController;
