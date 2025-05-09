
import React from "react";
import { format, parseISO } from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import { Music, Users, Calendar, MapPin, Clock, AlignLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  if (!event) return null;

  const getEventIcon = () => {
    switch (event.event_type) {
      case "practice":
        return <Music className="h-5 w-5 text-music-primary" />;
      case "community":
        return <Users className="h-5 w-5 text-music-secondary" />;
      default:
        return <Calendar className="h-5 w-5 text-music-tertiary" />;
    }
  };

  const getEventTypeLabel = () => {
    switch (event.event_type) {
      case "practice":
        return "Practice Session";
      case "community":
        return "Community Event";
      default:
        return "Other";
    }
  };

  // Access the routine title if available
  const routineTitle = event.routines?.title;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getEventIcon()}
            {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Event Type */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-white/70" />
            <span className="text-sm">{getEventTypeLabel()}</span>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-white/70" />
            <span className="text-sm">
              {format(parseISO(`${event.event_date}T${event.event_time}`), "PPP 'at' h:mm a")} 
              {" • "} 
              {event.duration_minutes} minutes
            </span>
          </div>

          {/* Routine */}
          {routineTitle && (
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-white/70" />
              <span className="text-sm">Routine: {routineTitle}</span>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-white/70" />
              <span className="text-sm">{event.location}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex gap-2">
              <AlignLeft className="h-4 w-4 text-white/70 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm text-white/70">{event.description}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Link to={`/calendar?event=${event.id}`}>
            <Button variant="default">
              View in Calendar
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
