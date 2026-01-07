import { z } from "zod";

export const editPostSchema = z.object({
  body: z
    .string()
    .max(40000, "body too long")
    .optional()
    .transform((val) => val?.trim()),
});
