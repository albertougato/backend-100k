import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { UserRepository } from "../repositories/UserRepository";

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
}