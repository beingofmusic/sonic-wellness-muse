
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, Play, Edit } from "lucide-react";
import { PracticeRoutine } from "@/types/practice";

interface MyRoutineCardProps {
  routine: PracticeRoutine;
}

const MyRoutineCard: React.FC<MyRoutineCardProps> = ({ routine }) => {
  return (
    <div className="p-5 rounded-xl border border-white/10 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-200">
      <div className="flex items-center mb-2">
        <Clock className="h-4 w-4 text-white/60 mr-2" />
        <span className="text-sm text-white/60">{routine.duration} min</span>
        <span className="ml-auto text-xs text-white/50">{routine.lastUpdated} ago</span>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{routine.title}</h3>
      <p className="text-white/70 text-sm mb-4">{routine.description}</p>
      
      <div className="flex gap-2 mt-4">
        <Button 
          className="flex-1 bg-music-primary hover:bg-music-secondary text-white"
        >
          <Play className="mr-2 h-4 w-4" />
          Resume
        </Button>
        <Button 
          variant="outline" 
          className="border-white/10 hover:border-white/20 bg-transparent"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>
    </div>
  );
};

export default MyRoutineCard;
