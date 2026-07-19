import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { UserRepository } from "../repositories/UserRepository";
import { createUserSchema, userIdSchema } from "../validators/userValidator";

const repository = new UserRepository();
const service = new UserService(repository);

export class UserController {
  static async getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
  ) {
    try {
      const users = await service.getUsers();

      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  static async createUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const dto = createUserSchema.parse(req.body);

      const user = await service.createUser(dto.name);

      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  static async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = userIdSchema.parse(req.params.id);

      const deleted = await service.deleteUser(id);

      if (!deleted) {
        res.status(404).json({
          message: "User not found",
        });

        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = userIdSchema.parse(req.params.id);

      const dto = createUserSchema.parse(req.body);

      const user = await service.updateUser(id, dto.name);

      if (!user) {
        res.status(404).json({
          message: "User not found",
        });

        return;
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}
