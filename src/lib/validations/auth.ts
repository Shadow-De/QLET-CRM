import { z } from "zod";

export const forgotPasswordSchema = z
  .object({
    email: z.string().email().max(255),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().uuid(),
    password: z
      .string()
      .min(10, "Password must be at least 10 characters")
      .max(128)
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  })
  .strict();

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
