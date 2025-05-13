
import React from "react";
import { formatDuration, formatSessionDate } from "@/services/practiceHistoryService";
import { PracticeSessionWithRoutine } from "@/services/practiceHistoryService";
import { Clock, Calendar, FileText, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PracticeHistoryItemProps {
  session: PracticeSessionWithRoutine;
}

const PracticeHistoryItem: React.FC<PracticeHistoryItemProps> = ({ session }) => {
  // Format the date for display
  const formattedDate = formatSessionDate(session.completed_at);
  const exactDate = new Date(session.completed_at).toLocaleDateString(undefined, {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  });
  
  // Format the duration for display
  const duration = formatDuration(session.total_duration);
  
  // Get description from manual entry if available
  const description = session.is_manual_entry && session.block_breakdown?.description
    ? session.block_breakdown.description
    : null;

  return (
    <div className="bg-card/70 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-card/90 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">
              {session.routine_title || "Unnamed Session"}
            </h3>
            {session.is_manual_entry && (
              <span className="bg-music-tertiary/20 text-music-tertiary text-xs px-2 py-0.5 rounded-full">
                Manual Entry
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/70">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1" title={exactDate}>
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            {description && (
              <div className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                <span className="truncate max-w-[280px]">{description}</span>
              </div>
            )}
          </div>
        </div>
        
        {session.routine_id && !session.is_manual_entry && (
          <div className="mt-3 sm:mt-0">
            <Link to={`/practice/routine/${session.routine_id}`}>
              <Button variant="outline" size="sm" className="border-white/10 bg-white/5">
                <span>View Routine</span>
                <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeHistoryItem;
