
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Target } from 'lucide-react';
import { useUpdateWellnessGoal } from '@/hooks/useWellness';

interface WellnessSetGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGoal: number;
}

const WellnessSetGoalDialog: React.FC<WellnessSetGoalDialogProps> = ({ 
  open, 
  onOpenChange,
  currentGoal
}) => {
  const [goal, setGoal] = useState(currentGoal);
  const updateGoal = useUpdateWellnessGoal();

  const handleSaveGoal = () => {
    updateGoal.mutate(goal, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setGoal(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" /> 
            Set Weekly Wellness Goal
          </DialogTitle>
          <DialogDescription>
            Set a goal for how many minutes of wellness practices you want to complete each week.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Minutes per week</span>
              <Input 
                type="number"
                value={goal}
                onChange={handleInputChange}
                className="w-20 h-8 text-right"
              />
            </div>
            
            <Slider 
              value={[goal]} 
              min={15}
              max={300}
              step={5}
              onValueChange={(vals) => setGoal(vals[0])}
              className="py-4"
            />
            
            <div className="flex justify-between text-xs text-white/50">
              <span>15 min</span>
              <span>1 hour</span>
              <span>2 hours</span>
              <span>5 hours</span>
            </div>
          </div>
          
          <div className="bg-card/30 backdrop-blur-sm border border-white/10 rounded p-3">
            <p className="text-sm">
              {goal < 30 ? (
                "Great for beginners starting a practice routine."
              ) : goal < 60 ? (
                "A solid commitment to regular wellness practice."
              ) : goal < 120 ? (
                "A strong dedication to your wellbeing."
              ) : (
                "An ambitious goal for advanced practitioners."
              )}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveGoal} 
            disabled={updateGoal.isPending}
            className="bg-music-primary hover:bg-music-primary/80"
          >
            {updateGoal.isPending ? "Saving..." : "Save Goal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WellnessSetGoalDialog;
