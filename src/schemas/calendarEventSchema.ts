
import * as z from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  event_type: z.enum(["practice", "community", "other"] as const),
  event_date: z.date({ required_error: "A date is required." }),
  event_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { 
    message: "Please enter a valid time in the format HH:MM." 
  }),
  duration_minutes: z.number().min(1, { message: "Duration must be at least 1 minute." }),
  location: z.string().optional(),
  description: z.string().optional(),
  routine_id: z.string().optional(),
  visibility: z.enum(["private", "public"]),
  zoom_link: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal(''))
});

export type EventFormData = z.infer<typeof eventFormSchema>;
