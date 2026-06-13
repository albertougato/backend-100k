import { UserRepository } from "../repositories/UserRepository";

export class UserService {
  constructor(
    private userRepository: UserRepository,
  ) {}

  async getUsers() {
    return this.userRepository.findAll();
  }

  
}