import { z } from "zod";

const emailSchema = z.string().email("Email is invalid");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
