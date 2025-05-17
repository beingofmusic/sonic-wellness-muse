
import * as z from "zod";

export const blockSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  content: z.string(),
  instructions: z.string().optional(),
  duration: z.number().int().positive(),
  order_index: z.number().int().min(0)
});

export const routineSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  visibility: z.enum(["public", "private"]).default("private"),
  blocks: z.array(blockSchema)
});

export type RoutineFormValues = z.infer<typeof routineSchema>;
export type BlockFormValues = z.infer<typeof blockSchema>;
