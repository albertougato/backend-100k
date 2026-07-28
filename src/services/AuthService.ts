import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { BusinessError } from "../errors/BusinessError";
import { User, UserRepository } from "../repositories/UserRepository";

const TOKEN_EXPIRATION = "1h";

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(name: string, email: string, password: string) {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new BusinessError("Email already exists", 409);
    }

    const existingName = await this.userRepository.findByName(name);

    if (existingName) {
      throw new BusinessError("User name already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepository.createWithCredentials(
      name,
      email,
      passwordHash,
    );

    return { user, token: this.createToken(user.id) };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new BusinessError("Invalid email or password", 401);
    }

    return {
      user: { id: user.id, name: user.name },
      token: this.createToken(user.id),
    };
  }

  async getProfile(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new BusinessError("User not found", 404);
    }

    return user;
  }

  private createToken(userId: number): string {
    return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });
  }
}
