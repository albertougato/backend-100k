"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    getUsers() {
        return this.userRepository.findAll();
    }
}
exports.UserService = UserService;
