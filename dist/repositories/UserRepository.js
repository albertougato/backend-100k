"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
class UserRepository {
    constructor() {
        this.users = [
            {
                id: 1,
                name: "Mario",
            },
        ];
    }
    findAll() {
        return this.users;
    }
}
exports.UserRepository = UserRepository;
