
import { z } from "zod";

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required"),

  description: z.string(),

  status: z.enum([
    "todo",
    "in-progress",
    "review",
    "done",
  ]),

  assigneeId: z
    .string()
    .min(1, "Please select an employee"),
});
