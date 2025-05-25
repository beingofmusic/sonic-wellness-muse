
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent, CalendarEventInput, EventType } from "@/types/calendar";
import { useAuth } from "@/context/AuthContext";

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const fetchEvents = async () => {
    if (!user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase
        .from("calendar_events")
        .select("*");
      
      // If not admin, only fetch user's own events
      if (!isAdmin) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setEvents(data as CalendarEvent[]);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<CalendarEventInput, "user_id">) => {
    if (!user) throw new Error("User not authenticated");
    
    const eventToCreate: CalendarEventInput = {
      ...eventData,
      user_id: user.id,
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

    if (error) throw error;
    
    setEvents(prevEvents => [...prevEvents, data as CalendarEvent]);
    return data;
  };

  const updateEvent = async (id: string, eventData: Partial<CalendarEventInput>) => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("calendar_events")
      .update(eventData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    
    setEvents(prevEvents => 
      prevEvents.map(event => event.id === id ? { ...event, ...data } as CalendarEvent : event)
    );
    return data;
  };

  const deleteEvent = async (id: string) => {
    if (!user) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", id);

    if (error) throw error;
    
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
  };

  useEffect(() => {
    fetchEvents();
  }, [user, isAdmin]);

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: fetchEvents
  };
};
