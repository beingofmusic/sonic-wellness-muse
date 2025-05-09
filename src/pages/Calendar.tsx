
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import CalendarView from "@/components/calendar/CalendarView";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import EventModal from "@/components/calendar/EventModal";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { CalendarEvent, CalendarEventFormData, ViewType, CalendarEventInput } from "@/types/calendar";

const Calendar: React.FC = () => {
  const [viewType, setViewType] = useState<ViewType>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { user } = useAuth();
  
  const {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent
  } = useCalendarEvents();

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (eventData: CalendarEventFormData) => {
    try {
      if (selectedEvent) {
        // Update existing event
        await updateEvent(selectedEvent.id, eventData);
        toast({
          title: "Event updated",
          description: "Your event has been updated successfully."
        });
      } else {
        // Create new event
        await createEvent(eventData);
        toast({
          title: "Event created",
          description: "Your event has been created successfully."
        });
      }
      setIsEventModalOpen(false);
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your event.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      toast({
        title: "Event deleted",
        description: "Your event has been deleted successfully."
      });
      setIsEventModalOpen(false);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "There was a problem deleting your event.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-white/70 mb-4">
            Schedule and manage your musical activities and practice sessions
          </p>
        </div>
        
        <CalendarHeader
          viewType={viewType}
          selectedDate={selectedDate}
          setViewType={setViewType}
          setSelectedDate={setSelectedDate}
          onAddEvent={handleAddEvent}
        />
        
        <CalendarView 
          viewType={viewType}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          events={events}
          isLoading={isLoading}
          onEventClick={handleEditEvent}
        />
        
        {user && (
          <EventModal
            open={isEventModalOpen}
            onOpenChange={setIsEventModalOpen}
            event={selectedEvent}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
          />
        )}
      </div>
    </Layout>
  );
};

export default Calendar;
