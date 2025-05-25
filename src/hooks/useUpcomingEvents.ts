
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { CalendarEvent } from "@/types/calendar";

export const useUpcomingEvents = (limit: number = 3) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      if (!user) {
        setEvents([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Get current date in ISO format
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        
        // Fetch upcoming events for the user
        const { data, error } = await supabase
          .from("calendar_events")
          .select("*, routines(title)")
          .eq("user_id", user.id)
          // Events from today onwards
          .gte("event_date", todayString)
          // Order by date then time
          .order("event_date", { ascending: true })
          .order("event_time", { ascending: true })
          .limit(limit);

        if (error) throw error;
        
        setEvents(data as CalendarEvent[]);
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, [user, limit]);

  return {
    events,
    isLoading
  };
};
