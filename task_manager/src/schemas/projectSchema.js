
import { z } from "zod";

export const projectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must have at least 3 characters"),

  description: z
    .string()
    .min(5, "Description must have at least 5 characters"),
});
