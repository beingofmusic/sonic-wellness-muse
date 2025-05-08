
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PracticeHistoryFiltersProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  routineFilter: string | null;
  onRoutineFilterChange: (routineId: string | null) => void;
  minDuration: number | null;
  onMinDurationChange: (minutes: number | null) => void;
}

const PracticeHistoryFilters: React.FC<PracticeHistoryFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  routineFilter,
  onRoutineFilterChange,
  minDuration,
  onMinDurationChange
}) => {
  const [open, setOpen] = React.useState(false);
  
  // Format the date range for display
  const dateRangeText = React.useMemo(() => {
    if (!dateRange.from && !dateRange.to) {
      return 'Select date range';
    }
    
    if (dateRange.from && !dateRange.to) {
      return `From ${format(dateRange.from, 'PPP')}`;
    }
    
    if (!dateRange.from && dateRange.to) {
      return `Until ${format(dateRange.to, 'PPP')}`;
    }
    
    return `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`;
  }, [dateRange]);
  
  // Handler for clearing all filters
  const clearFilters = () => {
    onDateRangeChange({ from: undefined, to: undefined });
    onRoutineFilterChange(null);
    onMinDurationChange(null);
  };
  
  // Check if any filters are applied
  const hasFilters = dateRange.from || dateRange.to || routineFilter || minDuration !== null;
  
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Filters</h3>
          
          {hasFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs text-white/60 hover:text-white"
              onClick={clearFilters}
            >
              Clear All
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Date Range Picker */}
          <div className="space-y-2">
            <Label htmlFor="date-range" className="text-sm text-white/80">Date Range</Label>
            
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date-range"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-white/10 bg-white/5",
                    !dateRange.from && !dateRange.to && "text-white/60"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRangeText}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range) => {
                    onDateRangeChange(range || { from: undefined, to: undefined });
                    if (range?.to) {
                      setOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Minimum Duration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="min-duration" className="text-sm text-white/80">Min. Duration</Label>
              {minDuration !== null && (
                <span className="text-xs text-white/60">
                  {minDuration} min
                </span>
              )}
            </div>
            
            <Slider
              id="min-duration"
              defaultValue={[0]}
              max={120}
              step={5}
              value={minDuration !== null ? [minDuration] : [0]}
              onValueChange={(value) => {
                const val = value[0];
                onMinDurationChange(val === 0 ? null : val);
              }}
              className="py-2"
            />
          </div>
          
          {/* For now, we'll skip the routine filter as it would require fetching all routines */}
          {/* We can implement this with a Select component later */}
        </div>
      </CardContent>
    </Card>
  );
};

export default PracticeHistoryFilters;
