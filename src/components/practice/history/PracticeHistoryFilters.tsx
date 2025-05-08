
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, FilterIcon, XIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isValid } from 'date-fns';

interface PracticeHistoryFiltersProps {
  onFilterChange: (filters: {
    dateRange?: DateRange | undefined;
    routineId?: string | null;
    minDuration?: number | null;
  }) => void;
  routines: Array<{ id: string; title: string }>;
  isLoading?: boolean;
  onClearFilters: () => void;
}

const PracticeHistoryFilters: React.FC<PracticeHistoryFiltersProps> = ({
  onFilterChange,
  routines,
  isLoading,
  onClearFilters
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  
  // Check if any filters are active
  const isFiltersActive = !!(dateRange || selectedRoutine || selectedDuration);
  
  // Apply all filters
  const applyFilters = () => {
    onFilterChange({
      dateRange: dateRange,
      routineId: selectedRoutine,
      minDuration: selectedDuration ? parseInt(selectedDuration) : null
    });
  };
  
  // Handle date preset selection
  const handleDatePreset = (preset: string) => {
    const today = new Date();
    let newRange: DateRange | undefined;
    
    switch (preset) {
      case 'week':
        newRange = {
          from: startOfWeek(today),
          to: endOfWeek(today)
        };
        break;
      case 'month':
        newRange = {
          from: startOfMonth(today),
          to: endOfMonth(today)
        };
        break;
      case 'all':
        newRange = undefined;
        break;
      default:
        break;
    }
    
    setDateRange(newRange);
    onFilterChange({
      dateRange: newRange,
      routineId: selectedRoutine,
      minDuration: selectedDuration ? parseInt(selectedDuration) : null
    });
  };
  
  // Handle filter clearing
  const clearFilters = () => {
    setDateRange(undefined);
    setSelectedRoutine(null);
    setSelectedDuration(null);
    onClearFilters();
  };
  
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant={dateRange ? "default" : "outline"} 
            className={`h-9 px-3 ${dateRange ? 'bg-music-primary text-white' : 'border-white/10 bg-white/5'}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                </>
              ) : (
                format(dateRange.from, "MMM d")
              )
            ) : (
              "Date Range"
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
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={(range) => {
              setDateRange(range);
              // Only trigger filter change if both dates are selected or range is cleared
              if ((range?.from && range?.to) || !range) {
                onFilterChange({
                  dateRange: range,
                  routineId: selectedRoutine,
                  minDuration: selectedDuration ? parseInt(selectedDuration) : null
                });
              }
            }}
            numberOfMonths={1}
            className="border-white/10"
          />
        </PopoverContent>
      </Popover>
      
      {/* Routine Filter */}
      <Select
        value={selectedRoutine || ''}
        onValueChange={(value) => {
          const routineId = value === '' ? null : value;
          setSelectedRoutine(routineId);
          onFilterChange({
            dateRange,
            routineId,
            minDuration: selectedDuration ? parseInt(selectedDuration) : null
          });
        }}
      >
        <SelectTrigger 
          className={`w-[150px] h-9 ${selectedRoutine ? 'bg-music-primary text-white border-music-primary' : 'border-white/10 bg-white/5'}`}
        >
          <SelectValue placeholder="Select Routine" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="">All Routines</SelectItem>
          {routines.map((routine) => (
            <SelectItem key={routine.id} value={routine.id}>
              {routine.title || 'Unnamed Routine'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Duration Filter */}
      <Select
        value={selectedDuration || ''}
        onValueChange={(value) => {
          const durValue = value === '' ? null : value;
          setSelectedDuration(durValue);
          onFilterChange({
            dateRange,
            routineId: selectedRoutine,
            minDuration: durValue ? parseInt(durValue) : null
          });
        }}
      >
        <SelectTrigger 
          className={`w-[150px] h-9 ${selectedDuration ? 'bg-music-primary text-white border-music-primary' : 'border-white/10 bg-white/5'}`}
        >
          <SelectValue placeholder="Min Duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Any Duration</SelectItem>
          <SelectItem value="5">5+ minutes</SelectItem>
          <SelectItem value="10">10+ minutes</SelectItem>
          <SelectItem value="15">15+ minutes</SelectItem>
          <SelectItem value="30">30+ minutes</SelectItem>
          <SelectItem value="60">1+ hour</SelectItem>
        </SelectContent>
      </Select>
      
      {/* Clear Filters Button */}
      {isFiltersActive && (
        <Button 
          variant="ghost"
          size="sm"
          className="h-9 border border-white/10"
          onClick={clearFilters}
        >
          <XIcon className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default PracticeHistoryFilters;
