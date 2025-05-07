
import * as z from "zod";

export const blockSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  content: z.string().min(1, "Content is required"),
  order_index: z.number(),
});

export const routineSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  blocks: z.array(blockSchema).min(1, "At least one block is required"),
});

export type RoutineFormValues = z.infer<typeof routineSchema>;
export type BlockFormValues = z.infer<typeof blockSchema>;
