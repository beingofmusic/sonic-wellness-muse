
import React from "react";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  parseISO,
  isToday,
  addDays,
  getHours
} from "date-fns";
import { CalendarEvent, ViewType } from "@/types/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import EventItem from "@/components/calendar/EventItem";

interface CalendarViewProps {
  viewType: ViewType;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  events: CalendarEvent[];
  isLoading: boolean;
  onEventClick: (event: CalendarEvent) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  viewType,
  selectedDate,
  setSelectedDate,
  events,
  isLoading,
  onEventClick
}) => {
  if (isLoading) {
    return (
      <div className="border border-white/10 rounded-lg overflow-hidden bg-card/50">
        <div className="grid grid-cols-7 bg-card/70 border-b border-white/10">
          {Array(7).fill(0).map((_, index) => (
            <div key={index} className="p-3 text-center">
              <Skeleton className="h-5 w-16 mx-auto" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-6 h-[600px]">
          {Array(42).fill(0).map((_, index) => (
            <div key={index} className="border-b border-r border-white/10 p-1 min-h-[100px]">
              <Skeleton className="h-6 w-6 mb-2" />
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.event_date);
      return isSameDay(eventDate, day);
    });
  };

  // Render month view
  if (viewType === "month") {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="border border-white/10 rounded-lg overflow-hidden bg-card/50">
        <div className="grid grid-cols-7 bg-card/70 border-b border-white/10">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center font-medium text-sm">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map(day => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isSelected = isSameDay(day, selectedDate);
            
            return (
              <div 
                key={format(day, "yyyy-MM-dd")}
                className={`border-b border-r border-white/10 p-1 min-h-[100px] ${
                  !isCurrentMonth ? "bg-card/30 text-white/40" : 
                  isToday(day) ? "bg-music-primary/5" : ""
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span 
                    className={`inline-flex justify-center items-center h-6 w-6 rounded-full text-sm ${
                      isSelected 
                        ? "bg-music-primary text-white font-medium" 
                        : isToday(day)
                        ? "bg-white/10 font-medium"
                        : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <div className="space-y-1 max-h-[80px] overflow-y-auto">
                  {dayEvents.slice(0, 3).map(event => (
                    <EventItem 
                      key={event.id} 
                      event={event} 
                      onClick={() => onEventClick(event)}
                      compact
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-white/70 mt-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render week view
  if (viewType === "week") {
    const weekStart = startOfWeek(selectedDate);
    const weekDays = Array(7).fill(0).map((_, i) => addDays(weekStart, i));
    const hours = Array(24).fill(0).map((_, i) => i);

    return (
      <div className="border border-white/10 rounded-lg overflow-hidden bg-card/50">
        <div className="grid grid-cols-8 bg-card/70 border-b border-white/10">
          <div className="p-3 text-center border-r border-white/10"></div>
          {weekDays.map(day => (
            <div 
              key={format(day, "yyyy-MM-dd")}
              className={`p-3 text-center font-medium text-sm ${
                isToday(day) ? "text-music-primary" : ""
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <div>{format(day, "EEE")}</div>
              <div className={`text-lg mt-1 ${
                isToday(day) ? "bg-music-primary/20 rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""
              }`}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-8 divide-x divide-white/10 h-[600px] overflow-y-auto">
          <div className="text-xs text-white/70 pr-2">
            {hours.map(hour => (
              <div key={hour} className="h-12 text-right relative">
                <span className="absolute -top-2 right-2">{hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}</span>
              </div>
            ))}
          </div>

          {weekDays.map(day => {
            const dayEvents = getEventsForDay(day);
            
            return (
              <div key={format(day, "yyyy-MM-dd")} className="relative">
                {hours.map(hour => (
                  <div key={hour} className="h-12 border-t border-white/10 relative"></div>
                ))}
                
                {dayEvents.map(event => {
                  const [hours, minutes] = event.event_time.split(":").map(Number);
                  const topPosition = (hours * 60 + minutes) / 15; // 15-minute intervals
                  const height = event.duration_minutes / 15; // Height based on duration
                  
                  return (
                    <div 
                      key={event.id}
                      className="absolute left-0 right-0 mx-1 rounded overflow-hidden shadow-md"
                      style={{
                        top: `${topPosition}px`,
                        height: `${height}px`,
                        minHeight: '20px',
                        backgroundColor: event.event_type === 'practice' ? 'rgba(var(--music-primary-rgb), 0.2)' : 
                                        event.event_type === 'community' ? 'rgba(var(--music-secondary-rgb), 0.2)' : 
                                        'rgba(var(--music-tertiary-rgb), 0.2)',
                        borderLeft: `3px solid ${
                          event.event_type === 'practice' ? 'rgb(var(--music-primary-rgb))' : 
                          event.event_type === 'community' ? 'rgb(var(--music-secondary-rgb))' : 
                          'rgb(var(--music-tertiary-rgb))'
                        }`
                      }}
                      onClick={() => onEventClick(event)}
                    >
                      <div className="p-1 text-xs truncate">
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-white/70 truncate">{format(parseISO(`${event.event_date}T${event.event_time}`), "h:mm a")}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render day view
  if (viewType === "day") {
    const hours = Array(24).fill(0).map((_, i) => i);
    const dayEvents = getEventsForDay(selectedDate);

    return (
      <div className="border border-white/10 rounded-lg overflow-hidden bg-card/50">
        <div className="bg-card/70 border-b border-white/10 p-4 text-center">
          <h3 className="text-lg font-medium">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] h-[600px] overflow-y-auto">
          <div className="hidden md:block text-xs text-white/70 pr-2 border-r border-white/10">
            {hours.map(hour => (
              <div key={hour} className="h-16 text-right pr-2 relative">
                <span className="absolute -top-2 right-2">{hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}</span>
              </div>
            ))}
          </div>

          <div className="relative">
            {hours.map(hour => (
              <div key={hour} className="h-16 border-t border-white/10 relative">
                <span className="md:hidden text-xs text-white/70 absolute top-0 left-2">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </span>
              </div>
            ))}
            
            {dayEvents.map(event => {
              const [hours, minutes] = event.event_time.split(":").map(Number);
              const topPosition = (hours * 60 + minutes) / (60 / 16); // 16px per 15 minutes
              const height = event.duration_minutes / (60 / 16); // Height based on duration
              
              return (
                <div 
                  key={event.id}
                  className="absolute left-6 right-2 md:left-2 rounded overflow-hidden shadow-md"
                  style={{
                    top: `${topPosition}px`,
                    height: `${height}px`,
                    minHeight: '30px',
                    backgroundColor: event.event_type === 'practice' ? 'rgba(var(--music-primary-rgb), 0.2)' : 
                                   event.event_type === 'community' ? 'rgba(var(--music-secondary-rgb), 0.2)' : 
                                   'rgba(var(--music-tertiary-rgb), 0.2)',
                    borderLeft: `3px solid ${
                      event.event_type === 'practice' ? 'rgb(var(--music-primary-rgb))' : 
                      event.event_type === 'community' ? 'rgb(var(--music-secondary-rgb))' : 
                      'rgb(var(--music-tertiary-rgb))'
                    }`
                  }}
                  onClick={() => onEventClick(event)}
                >
                  <div className="p-2 text-sm">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-white/70">{format(parseISO(`${event.event_date}T${event.event_time}`), "h:mm a")} - {event.duration_minutes} min</div>
                    {event.location && <div className="text-white/70 text-xs">📍 {event.location}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CalendarView;
