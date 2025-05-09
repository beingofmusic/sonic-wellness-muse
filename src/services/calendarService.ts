
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent, CalendarEventInput } from "@/types/calendar";

export const fetchUserCalendarEvents = async (userId: string): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }

  return data as CalendarEvent[];
};

export const fetchAllCalendarEvents = async (): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*");

  if (error) {
    console.error("Error fetching all calendar events:", error);
    throw error;
  }

  return data as CalendarEvent[];
};

export const createCalendarEvent = async (
  eventData: Omit<CalendarEventInput, "user_id">,
  userId: string
): Promise<CalendarEvent> => {
  const eventToCreate: CalendarEventInput = {
    ...eventData,
    user_id: userId,
    // Ensure required fields are present
    title: eventData.title,
    event_type: eventData.event_type,
    event_date: eventData.event_date,
    event_time: eventData.event_time,
    duration_minutes: eventData.duration_minutes
  };

  const { data, error } = await supabase
    .from("calendar_events")
    .insert(eventToCreate)
    .select()
    .single();

  if (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }

  return data as CalendarEvent;
};

export const updateCalendarEvent = async (
  eventId: string,
  updates: Partial<CalendarEventInput>
): Promise<CalendarEvent> => {
  const { data, error } = await supabase
    .from("calendar_events")
    .update(updates)
    .eq("id", eventId)
    .select()
    .single();

  if (error) {
    console.error("Error updating calendar event:", error);
    throw error;
  }

  return data as CalendarEvent;
};

export const deleteCalendarEvent = async (eventId: string): Promise<void> => {
  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", eventId);

  if (error) {
    console.error("Error deleting calendar event:", error);
    throw error;
  }
};
