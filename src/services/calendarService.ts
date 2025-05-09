
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/calendar";

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
  eventData: Partial<CalendarEvent>,
  userId: string
): Promise<CalendarEvent> => {
  const { data, error } = await supabase
    .from("calendar_events")
    .insert({ ...eventData, user_id: userId })
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
  updates: Partial<CalendarEvent>
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
