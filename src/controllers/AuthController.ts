import { NextFunction, Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository";
import { AuthService } from "../services/AuthService";
import { loginSchema, registerSchema } from "../validators/authValidator";

const service = new AuthService(new UserRepository());

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = registerSchema.parse(req.body);
      const result = await service.register(dto.name, dto.email, dto.password);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = loginSchema.parse(req.body);
      const result = await service.login(dto.email, dto.password);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await service.getProfile(req.user!.id);

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}
