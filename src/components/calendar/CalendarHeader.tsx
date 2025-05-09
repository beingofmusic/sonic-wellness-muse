
import React from "react";
import { Button } from "@/components/ui/button";
import { ViewType } from "@/types/calendar";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus
} from "lucide-react";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";

interface CalendarHeaderProps {
  viewType: ViewType;
  selectedDate: Date;
  setViewType: (type: ViewType) => void;
  setSelectedDate: (date: Date) => void;
  onAddEvent: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewType,
  selectedDate,
  setViewType,
  setSelectedDate,
  onAddEvent
}) => {
  const navigatePrevious = () => {
    switch (viewType) {
      case "month":
        setSelectedDate(subMonths(selectedDate, 1));
        break;
      case "week":
        setSelectedDate(subWeeks(selectedDate, 1));
        break;
      case "day":
        setSelectedDate(subDays(selectedDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewType) {
      case "month":
        setSelectedDate(addMonths(selectedDate, 1));
        break;
      case "week":
        setSelectedDate(addWeeks(selectedDate, 1));
        break;
      case "day":
        setSelectedDate(addDays(selectedDate, 1));
        break;
    }
  };

  const navigateToday = () => {
    setSelectedDate(new Date());
  };

  const formatDateHeading = () => {
    switch (viewType) {
      case "month":
        return format(selectedDate, "MMMM yyyy");
      case "week":
        return `Week of ${format(selectedDate, "MMM d, yyyy")}`;
      case "day":
        return format(selectedDate, "EEEE, MMM d, yyyy");
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigatePrevious}
          className="h-9 w-9 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToday}
          className="hidden md:flex"
        >
          Today
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateNext}
          className="h-9 w-9 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold ml-2">
          {formatDateHeading()}
        </h2>
      </div>

      <div className="flex items-center space-x-2 w-full md:w-auto">
        <div className="flex bg-card/50 border border-white/10 rounded-md p-1 mr-2">
          <Button 
            variant={viewType === "month" ? "default" : "ghost"}
            size="sm"
            className="px-3"
            onClick={() => setViewType("month")}
          >
            Month
          </Button>
          <Button 
            variant={viewType === "week" ? "default" : "ghost"}
            size="sm"
            className="px-3"
            onClick={() => setViewType("week")}
          >
            Week
          </Button>
          <Button 
            variant={viewType === "day" ? "default" : "ghost"}
            size="sm"
            className="px-3"
            onClick={() => setViewType("day")}
          >
            Day
          </Button>
        </div>
        
        <Button 
          onClick={onAddEvent}
          className="ml-auto md:ml-0"
          size="sm"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Event
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
