
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import UpcomingEventItem from "./UpcomingEventItem";
import EventDetailsDialog from "./EventDetailsDialog";
import { CalendarEvent } from "@/types/calendar";
import { Card } from "@/components/ui/card";

const UpcomingEvents: React.FC = () => {
  const { events, isLoading } = useUpcomingEvents(3);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col h-48 items-center justify-center text-center text-white/50">
          <div className="animate-pulse">Loading upcoming events...</div>
        </div>
      );
    }

    if (events.length === 0) {
      return (
        <div className="flex flex-col h-48 items-center justify-center text-center text-white/50">
          <Calendar className="h-12 w-12 mb-2 opacity-30" />
          <p>No upcoming events</p>
          <p className="text-sm">Schedule a practice session</p>
        </div>
      );
    }

    return (
      <div className="space-y-1 mt-2">
        {events.map((event) => (
          <UpcomingEventItem
            key={event.id}
            event={event}
            onClick={() => handleEventClick(event)}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="p-4 bg-white/5 border-white/10">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Upcoming Events</h3>
        <div className="flex gap-2">
          <Link to="/calendar?action=create">
            <Button variant="ghost" size="sm" className="text-xs bg-transparent border border-white/10 hover:bg-white/5 text-white/70">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </Link>
          <Link to="/calendar">
            <Button variant="ghost" size="sm" className="text-xs bg-transparent border border-white/10 hover:bg-white/5 text-white/70">
              View All
            </Button>
          </Link>
        </div>
      </div>
      
      {renderContent()}
      
      <EventDetailsDialog 
        event={selectedEvent}
        isOpen={isEventDetailsOpen}
        onClose={() => setIsEventDetailsOpen(false)}
      />
    </Card>
  );
};

export default UpcomingEvents;
