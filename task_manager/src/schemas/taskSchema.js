
import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().trim().min(
    3,
    "Task title must have at least 3 characters"
  ),

  description: z.string().trim().min(
    5,
    "Description must have at least 5 characters"
  ),

  status: z.enum(["todo", "in-progress", "done"]),
});
