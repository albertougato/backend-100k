"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const BusinessError_1 = require("../errors/BusinessError");
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async getUsers() {
        return this.userRepository.findAll();
    }
    async createUser(name) {
        const existingUser = await this.userRepository.findByName(name);
        if (existingUser) {
            throw new BusinessError_1.BusinessError("User already exists", 409);
        }
        return this.userRepository.create(name);
    }
}
exports.UserService = UserService;
