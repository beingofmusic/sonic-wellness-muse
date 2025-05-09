
export type ViewType = "month" | "week" | "day";

export type EventType = "practice" | "community" | "other";

export interface CalendarEvent {
  id: string;
  title: string;
  event_type: EventType;
  event_date: string; // ISO format date
  event_time: string; // HH:MM:SS format
  duration_minutes: number;
  location?: string;
  description?: string;
  routine_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventFormData {
  title: string;
  event_type: EventType;
  event_date: Date;  // JavaScript Date object for form handling
  event_time: string; // HH:MM format
  duration_minutes: number;
  location?: string;
  description?: string;
  routine_id?: string;
}

export interface CalendarEventInput {
  title: string;
  event_type: EventType;
  event_date: string; // String format for API/database
  event_time: string; // HH:MM:SS format for API/database
  duration_minutes: number;
  location?: string;
  description?: string;
  routine_id?: string;
  user_id: string;
}
