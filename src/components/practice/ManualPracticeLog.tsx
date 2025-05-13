
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, PlusCircle, X } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { logManualPracticeSession } from "@/services/practiceStatsService";
import { useToast } from "@/hooks/use-toast";

const ManualPracticeLog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [duration, setDuration] = useState<number | "">(30);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (duration === "") {
      toast({
        title: "Duration required",
        description: "Please enter how many minutes you practiced.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await logManualPracticeSession(
        Number(duration),
        date,
        description
      );
      
      if (result.success) {
        toast({
          title: "Practice logged successfully",
          description: `Added ${duration} minutes to your practice history.`,
        });
        
        // Reset form after successful submission
        setDuration(30);
        setDescription("");
        setDate(new Date());
        setIsOpen(false);
        
        // If there are new badges, show a notification
        if (result.newBadges && result.newBadges.length > 0) {
          toast({
            title: "New achievement unlocked!",
            description: `You've earned ${result.newBadges.length} new badge${
              result.newBadges.length > 1 ? "s" : ""
            }!`,
          });
        }
      } else {
        throw new Error("Failed to log practice session");
      }
    } catch (error) {
      console.error("Error logging practice:", error);
      toast({
        title: "Something went wrong",
        description: "Could not log your practice session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full border border-white/10 rounded-xl bg-card/70 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-lg font-medium">Log External Practice</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            {isOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isOpen ? "Close" : "Log external practice"}
            </span>
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <div className="px-5 pb-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="practice-date">
                  Practice Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="practice-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-card/50",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="practice-duration">
                  Duration (minutes)
                </label>
                <Input
                  id="practice-duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value === "" ? "" : parseInt(e.target.value))}
                  className="bg-card/50"
                  placeholder="How long did you practice?"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="practice-description">
                What did you practice? (optional)
              </label>
              <Textarea
                id="practice-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-card/50"
                placeholder="Describe what you practiced..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading || duration === "" || duration <= 0}
              >
                {isLoading ? "Logging..." : "Log Practice"}
              </Button>
            </div>
          </form>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ManualPracticeLog;
