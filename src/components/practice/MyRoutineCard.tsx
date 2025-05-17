
import React from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, Edit2, Play, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PracticeRoutine } from "@/types/practice";
import { Badge } from "@/components/ui/badge";

interface MyRoutineCardProps {
  routine: PracticeRoutine;
}

const MyRoutineCard: React.FC<MyRoutineCardProps> = ({ routine }) => {
  // Format duration to readable form
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`;
  };

  return (
    <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all hover:shadow-md">
      <div className="p-5 flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{routine.title}</h3>
            <Badge variant={routine.visibility === 'public' ? 'default' : 'outline'} className="ml-2">
              {routine.visibility === 'public' ? (
                <><Eye className="mr-1 h-3 w-3" /> Public</>
              ) : (
                <><EyeOff className="mr-1 h-3 w-3" /> Private</>
              )}
            </Badge>
          </div>
          
          <p className="text-white/70 line-clamp-2 text-sm mb-3">
            {routine.description || "No description provided"}
          </p>
          
          {routine.progress !== undefined && (
            <div className="mb-3">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-music-primary rounded-full" 
                  style={{ width: `${routine.progress}%` }}
                />
              </div>
              <p className="text-xs text-white/50 mt-1">
                {routine.progress}% complete
              </p>
            </div>
          )}
          
          <div className="flex items-center text-sm text-white/70 space-x-4 mb-4">
            <div className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              <span>{formatDuration(routine.duration)}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              <span>{routine.lastUpdated}</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 pt-2 border-t border-white/10">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 bg-white/5"
            asChild
          >
            <Link to={`/practice/builder/${routine.id}`}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 bg-music-primary"
            asChild
          >
            <Link to={`/practice/routine/${routine.id}`}>
              <Play className="mr-2 h-4 w-4" />
              Practice
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyRoutineCard;
