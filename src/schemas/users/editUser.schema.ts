import { z } from "zod";

export const editUserSchema = z
  .object({
    username: z
      .string()
      .min(2, "Username must be at least 2 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-z0-9$_*]+$/i,
        "Username can only contain letters, numbers, $, *, and _"
      )
      .transform((val) => val.trim().toLowerCase())
      .optional(),

    email: z
      .email()
      .transform((val) => val.trim().toLowerCase())
      .optional(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be at most 20 characters")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
