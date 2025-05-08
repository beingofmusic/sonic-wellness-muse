
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, FilterIcon, XIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isValid } from 'date-fns';

interface PracticeHistoryFiltersProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  routineFilter: string | null;
  onRoutineFilterChange: (routineId: string | null) => void;
  minDuration: number | null;
  onMinDurationChange: (duration: number | null) => void;
}

const PracticeHistoryFilters: React.FC<PracticeHistoryFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  routineFilter,
  onRoutineFilterChange,
  minDuration,
  onMinDurationChange
}) => {
  // Check if any filters are active
  const isFiltersActive = !!(dateRange.from || routineFilter || minDuration);
  
  // Handle date preset selection
  const handleDatePreset = (preset: string) => {
    const today = new Date();
    let newRange: { from: Date | undefined; to: Date | undefined } = { from: undefined, to: undefined };
    
    switch (preset) {
      case 'week':
        newRange = {
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: endOfWeek(today, { weekStartsOn: 1 })
        };
        break;
      case 'month':
        newRange = {
          from: startOfMonth(today),
          to: endOfMonth(today)
        };
        break;
      case 'all':
        newRange = { from: undefined, to: undefined };
        break;
      default:
        break;
    }
    
    onDateRangeChange(newRange);
  };
  
  // Handle filter clearing
  const clearFilters = () => {
    onDateRangeChange({ from: undefined, to: undefined });
    onRoutineFilterChange(null);
    onMinDurationChange(null);
  };
  
  // Convert DateRange to our component's expected format
  const handleCalendarSelect = (range: DateRange | undefined) => {
    onDateRangeChange({
      from: range?.from,
      to: range?.to
    });
  };
  
  // Get current date range in the format required by the Calendar component
  const calendarValue: DateRange | undefined = dateRange.from ? {
    from: dateRange.from,
    to: dateRange.to
  } : undefined;
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-medium mb-2">Filter Practice Sessions</h3>
      
      <div className="space-y-4">
        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-xs text-white/70">Date Range</label>
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant={dateRange.from ? "default" : "outline"} 
                  className={`h-9 px-3 ${dateRange.from ? 'bg-music-primary text-white' : 'border-white/10 bg-white/5'}`}
                  size="sm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d")
                    )
                  ) : (
                    "Select dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card dark" align="start">
                <div className="p-2 border-b border-white/10">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7"
                      onClick={() => handleDatePreset('week')}
                    >
                      This Week
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7"
                      onClick={() => handleDatePreset('month')}
                    >
                      This Month
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7"
                      onClick={() => handleDatePreset('all')}
                    >
                      All Time
                    </Button>
                  </div>
                </div>
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={calendarValue}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={1}
                  className="border-white/10"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Routine Filter */}
        <div className="space-y-2">
          <label className="text-xs text-white/70">Routine</label>
          <Select
            value={routineFilter || "all"}
            onValueChange={(value) => {
              const routineId = value === "all" ? null : value;
              onRoutineFilterChange(routineId);
            }}
          >
            <SelectTrigger 
              className={`w-full h-9 ${routineFilter ? 'bg-music-primary text-white border-music-primary' : 'border-white/10 bg-white/5'}`}
            >
              <SelectValue placeholder="All Routines" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">All Routines</SelectItem>
              {/* Routines would be mapped here */}
            </SelectContent>
          </Select>
        </div>
        
        {/* Duration Filter */}
        <div className="space-y-2">
          <label className="text-xs text-white/70">Minimum Duration</label>
          <Select
            value={minDuration?.toString() || "any"}
            onValueChange={(value) => {
              const durValue = value === "any" ? null : parseInt(value);
              onMinDurationChange(durValue);
            }}
          >
            <SelectTrigger 
              className={`w-full h-9 ${minDuration ? 'bg-music-primary text-white border-music-primary' : 'border-white/10 bg-white/5'}`}
            >
              <SelectValue placeholder="Any Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Duration</SelectItem>
              <SelectItem value="5">5+ minutes</SelectItem>
              <SelectItem value="10">10+ minutes</SelectItem>
              <SelectItem value="15">15+ minutes</SelectItem>
              <SelectItem value="30">30+ minutes</SelectItem>
              <SelectItem value="60">1+ hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Clear Filters Button */}
        {isFiltersActive && (
          <Button 
            variant="ghost"
            size="sm"
            className="w-full h-9 border border-white/10 mt-2"
            onClick={clearFilters}
          >
            <XIcon className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default PracticeHistoryFilters;
