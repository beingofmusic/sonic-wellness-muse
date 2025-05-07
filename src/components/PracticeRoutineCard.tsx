
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface PracticeRoutineCardProps {
  title: string;
  duration: string;
  progress: number;
  onContinue?: () => void;
  onSchedule?: () => void;
}

const PracticeRoutineCard: React.FC<PracticeRoutineCardProps> = ({
  title,
  duration,
  progress,
  onContinue,
  onSchedule,
}) => {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-card/80 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{title}</h3>
        <div className="flex items-center gap-1 text-sm text-white/70">
          <Clock className="h-3 w-3" />
          <span>{duration}</span>
        </div>
      </div>
      <div className="mb-3">
        <div className="progress-bar">
          <div
            className="progress-value"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>{progress}% completed</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onContinue}
          className="flex-1 music-button"
        >
          Continue Practice
        </Button>
        <Button
          onClick={onSchedule}
          variant="outline"
          className="border-white/10 hover:border-white/20 bg-transparent"
        >
          Schedule
        </Button>
      </div>
    </div>
  );
};

export default PracticeRoutineCard;
