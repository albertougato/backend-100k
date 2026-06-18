import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name too long"),
});

export type CreateUserDto = z.infer<
  typeof createUserSchema
>;