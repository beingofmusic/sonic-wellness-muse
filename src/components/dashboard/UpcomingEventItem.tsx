
import React from "react";
import { format, parseISO } from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import { Music, Users, Calendar } from "lucide-react";

interface UpcomingEventItemProps {
  event: CalendarEvent;
  onClick: () => void;
}

const UpcomingEventItem: React.FC<UpcomingEventItemProps> = ({ event, onClick }) => {
  const getEventIcon = () => {
    switch (event.event_type) {
      case "practice":
        return <Music className="h-4 w-4" />;
      case "community":
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = () => {
    switch (event.event_type) {
      case "practice":
        return "bg-music-primary/20 border-l-music-primary";
      case "community":
        return "bg-music-secondary/20 border-l-music-secondary";
      default:
        return "bg-music-tertiary/20 border-l-music-tertiary";
    }
  };

  const formatEventDate = () => {
    const eventDate = parseISO(`${event.event_date}T${event.event_time}`);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return `Today at ${format(eventDate, "h:mm a")}`;
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${format(eventDate, "h:mm a")}`;
    } else {
      return format(eventDate, "MMM d 'at' h:mm a");
    }
  };

  // Access the routine title if available
  const routineTitle = event.routines?.title;

  return (
    <div
      onClick={onClick}
      className={`flex flex-col p-3 rounded-lg border-l-4 mb-2 cursor-pointer hover:bg-white/5 transition-all ${getEventColor()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-full ${getEventColor()}`}>
            {getEventIcon()}
          </div>
          <h4 className="font-medium text-sm">{event.title}</h4>
        </div>
        <span className="text-xs text-white/70">{format(parseISO(`${event.event_date}T${event.event_time}`), "h:mm a")}</span>
      </div>
      
      <div className="mt-1 flex flex-col">
        <p className="text-xs text-white/60">{formatEventDate()}</p>
        {routineTitle && (
          <p className="text-xs text-music-primary mt-1">
            Routine: {routineTitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default UpcomingEventItem;
