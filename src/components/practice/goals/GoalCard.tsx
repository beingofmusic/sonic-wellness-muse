
import React from "react";
import { format, isPast, parseISO } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, FileMusic, Sparkles, Repeat, Music, Clock, CheckCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PracticeGoal } from "@/types/goals";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  goal: PracticeGoal;
  onEdit: (goal: PracticeGoal) => void;
  onDelete: (goalId: string) => void;
}

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  // Get the appropriate icon for this goal's category
  const getCategoryIcon = () => {
    switch (goal.category) {
      case "Technique":
        return <TrendingUp className="h-4 w-4" />;
      case "Performance":
        return <Music className="h-4 w-4" />;
      case "Repertoire":
        return <FileMusic className="h-4 w-4" />;
      case "Creativity":
        return <Sparkles className="h-4 w-4" />;
      case "Habit":
        return <Repeat className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Check if goal is past due
  const isPastDue = goal.targetDate && isPast(parseISO(goal.targetDate)) && goal.progress < 100;
  
  // Format created date
  const formattedCreatedDate = format(parseISO(goal.createdAt), "MMM d, yyyy");
  
  return (
    <Card className="border border-white/10 bg-card/70 backdrop-blur-sm overflow-hidden">
      <div className="relative">
        {/* Header with category and status indicator */}
        <div className="p-4 pb-2 flex justify-between items-start">
          <div className="flex items-center gap-1.5">
            <span 
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                goal.category === "Technique" && "bg-blue-500/20 text-blue-400",
                goal.category === "Performance" && "bg-purple-500/20 text-purple-400", 
                goal.category === "Repertoire" && "bg-amber-500/20 text-amber-400",
                goal.category === "Creativity" && "bg-pink-500/20 text-pink-400",
                goal.category === "Habit" && "bg-emerald-500/20 text-emerald-400"
              )}
            >
              {getCategoryIcon()}
              {goal.category}
            </span>
          </div>
          
          {/* Completed indicator */}
          {goal.isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" />
              Completed
            </span>
          )}
          
          {/* Past due indicator */}
          {isPastDue && (
            <span className="inline-flex items-center gap-1 text-xs text-red-400">
              <Clock className="h-3.5 w-3.5" />
              Past due
            </span>
          )}
        </div>
        
        {/* Card content */}
        <CardContent className="pt-0">
          <h3 className="text-lg font-medium mb-1">{goal.title}</h3>
          <p className="text-sm text-white/70 mb-4">{goal.description}</p>
          
          {/* Progress section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Progress</span>
              <span className="text-xs font-medium">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-1.5" />
          </div>
          
          {/* Target date */}
          {goal.targetDate && (
            <div className="mt-4 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-white/70" />
              <span className={cn(
                "text-xs",
                isPastDue ? "text-red-400" : "text-white/70"
              )}>
                Target: {format(parseISO(goal.targetDate), "MMM d, yyyy")}
              </span>
            </div>
          )}
        </CardContent>
        
        {/* Footer with created date and actions */}
        <CardFooter className="border-t border-white/5 pt-2 px-4 pb-3 flex justify-between items-center">
          <div className="text-xs text-white/50">
            Created: {formattedCreatedDate}
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(goal)}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-400" onClick={() => onDelete(goal.id)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
