
import React from "react";
import { CalendarEvent } from "@/types/calendar";
import { format, parseISO } from "date-fns";
import { Music, Users, Calendar } from "lucide-react";

interface EventItemProps {
  event: CalendarEvent;
  onClick: () => void;
  compact?: boolean;
}

const EventItem: React.FC<EventItemProps> = ({ event, onClick, compact = false }) => {
  const getEventIcon = () => {
    switch (event.event_type) {
      case "practice":
        return <Music className="h-3 w-3" />;
      case "community":
        return <Users className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const getEventColor = () => {
    switch (event.event_type) {
      case "practice":
        return "bg-music-primary/20 border-music-primary text-music-primary";
      case "community":
        return "bg-music-secondary/20 border-music-secondary text-music-secondary";
      default:
        return "bg-music-tertiary/20 border-music-tertiary text-music-tertiary";
    }
  };

  if (compact) {
    return (
      <div
        className={`flex items-center text-xs rounded px-1 py-0.5 cursor-pointer ${getEventColor()}`}
        onClick={onClick}
      >
        <span className="mr-1">{getEventIcon()}</span>
        <span className="truncate">{event.title}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded cursor-pointer ${getEventColor()} hover:opacity-80 transition-opacity`}
      onClick={onClick}
    >
      <div className="p-1 rounded bg-white/10">
        {getEventIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{event.title}</h4>
        <p className="text-xs opacity-80">
          {format(parseISO(`${event.event_date}T${event.event_time}`), "h:mm a")} - {event.duration_minutes} min
        </p>
      </div>
    </div>
  );
};

export default EventItem;
