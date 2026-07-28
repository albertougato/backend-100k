import { UserRepository } from "../repositories/UserRepository";
import { BusinessError } from "../errors/BusinessError";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUsers() {
    return this.userRepository.findAll();
  }

  async createUser(name: string) {
    const existingUser = await this.userRepository.findByName(name);

    if (existingUser) {
      throw new BusinessError("User already exists", 409);
    }

    return this.userRepository.create(name);
  }

  async deleteUser(id: number) {
    return this.userRepository.delete(id);
  }

  async updateUser(id: number, name: string) {
    const existingUser = await this.userRepository.findByName(name);

    if (existingUser && existingUser.id !== id) {
      throw new BusinessError("User already exists", 409);
    }

    return this.userRepository.update(id, name);
  }
}
