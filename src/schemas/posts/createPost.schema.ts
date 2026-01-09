import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .max(300, "Title too long")
    .transform((val) => val.trim()),

  body: z
    .string()
    .max(40000, "body too long")
    .transform((val) => val.trim())
    .optional(),
});
