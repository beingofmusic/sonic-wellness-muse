
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, Play, Edit, Star } from "lucide-react";
import { PracticeRoutine } from "@/types/practice";
import { Link } from "react-router-dom";
import { useRatingSummary } from "@/hooks/useRoutineFeedback";

interface MyRoutineCardProps {
  routine: PracticeRoutine;
}

const MyRoutineCard: React.FC<MyRoutineCardProps> = ({ routine }) => {
  const { data: ratingSummary } = useRatingSummary(routine.id);
  const avg = ratingSummary ? Math.round(ratingSummary.average * 10) / 10 : null;
  return (
    <div className="p-5 rounded-xl border border-white/10 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-200">
      <div className="flex items-center mb-2">
        <Clock className="h-4 w-4 text-white/60 mr-2" />
        <span className="text-sm text-white/60">{routine.duration} min</span>
        <span className="ml-auto text-xs text-white/50">{routine.lastUpdated}</span>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{routine.title}</h3>
<p className="text-white/70 text-sm mb-2">{routine.description}</p>
{avg !== null && ratingSummary && (
  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
    <span>{avg.toFixed(1)} ({ratingSummary.count} ratings)</span>
  </div>
)}
<div className="flex gap-2 mt-4">
        <Link 
          to={`/practice/routine/${routine.id}`}
          className="flex-1"
        >
          <Button className="w-full bg-music-primary hover:bg-music-secondary text-white">
            <Play className="mr-2 h-4 w-4" />
            Resume
          </Button>
        </Link>
        
        <Link 
          to={`/practice/builder/${routine.id}`}
          className="flex-shrink-0"
        >
          <Button 
            variant="outline"
            className="border-white/10 hover:border-white/20 bg-transparent"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MyRoutineCard;
