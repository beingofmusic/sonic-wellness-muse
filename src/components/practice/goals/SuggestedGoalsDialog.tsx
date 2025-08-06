import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Sparkles, TrendingUp, Music, FileMusic, Repeat } from "lucide-react";
import { GoalCategory } from "@/types/goals";
import { suggestedGoals, getRandomGoal, SuggestedGoal } from "@/data/suggestedGoals";
import { cn } from "@/lib/utils";

interface SuggestedGoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGoal: (goal: SuggestedGoal) => void;
}

export function SuggestedGoalsDialog({ open, onOpenChange, onSelectGoal }: SuggestedGoalsDialogProps) {
  const [activeCategory, setActiveCategory] = useState<GoalCategory>("Technique");

  const getCategoryIcon = (category: GoalCategory) => {
    switch (category) {
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
    }
  };

  const handleUseGoal = (goal: SuggestedGoal) => {
    onSelectGoal(goal);
    onOpenChange(false);
  };

  const handleFeelingLucky = () => {
    const randomGoal = getRandomGoal();
    handleUseGoal(randomGoal);
  };

  const SuggestedGoalCard = ({ goal }: { goal: SuggestedGoal }) => (
    <div className="group p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getCategoryIcon(goal.category)}
          <h3 className="font-medium text-sm leading-tight">{goal.title}</h3>
        </div>
        <Badge variant="secondary" className="text-xs bg-white/10">
          {goal.category}
        </Badge>
      </div>
      
      <p className="text-sm text-white/70 mb-4 line-clamp-2">
        {goal.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-white/60">
          {goal.estimatedWeeks && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {goal.estimatedWeeks}
            </div>
          )}
          {goal.targetDays && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {goal.targetDays} days
            </div>
          )}
        </div>
        
        <Button
          size="sm"
          onClick={() => handleUseGoal(goal)}
          className="opacity-0 group-hover:opacity-100 transition-opacity bg-music-primary hover:bg-music-secondary text-xs h-7 px-3"
        >
          Use This Goal
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-music-primary" />
              Browse Suggested Goals
            </DialogTitle>
            <Button
              onClick={handleFeelingLucky}
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-music-primary/20 to-music-secondary/20 border-music-primary/30 hover:bg-gradient-to-r hover:from-music-primary/30 hover:to-music-secondary/30"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Feeling Lucky
            </Button>
          </div>
          <p className="text-sm text-white/70">
            Get inspired by these curated practice goals. Click "Use This Goal" to start with a pre-filled template.
          </p>
        </DialogHeader>

        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as GoalCategory)}>
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-background/5 border border-white/5">
            {(["Technique", "Performance", "Repertoire", "Creativity", "Habit"] as GoalCategory[]).map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white gap-1.5 text-xs"
              >
                {getCategoryIcon(category)}
                <span className="hidden sm:inline">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {(["Technique", "Performance", "Repertoire", "Creativity", "Habit"] as GoalCategory[]).map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {suggestedGoals[category].map((goal) => (
                  <SuggestedGoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}