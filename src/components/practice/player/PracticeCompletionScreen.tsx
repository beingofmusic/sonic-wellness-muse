
import React, { useEffect } from "react";
import { PracticeRoutine, RoutineBlock } from "@/types/practice";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle, Home, History, Music } from "lucide-react";
import { logPracticeSession } from "@/services/practiceStatsService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useBadgeNotificationContext } from "@/context/BadgeNotificationContext";

interface PracticeCompletionScreenProps {
  routine: PracticeRoutine;
  blocks: RoutineBlock[];
  sessionId?: string;
}

const PracticeCompletionScreen: React.FC<PracticeCompletionScreenProps> = ({
  routine,
  blocks,
  sessionId
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { showBadgeNotification } = useBadgeNotificationContext();

  // Calculate total duration
  const totalDuration = blocks.reduce((sum, block) => sum + block.duration, 0);
  
  // Format minutes as hours and minutes
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}${mins > 0 ? ` ${mins} ${mins === 1 ? 'minute' : 'minutes'}` : ''}`;
  };
  
  // Save practice session
  useEffect(() => {
    const saveSession = async () => {
      const { success, newBadges } = await logPracticeSession(
        routine.id,
        totalDuration,
        blocks,
        sessionId
      );
      
      if (success) {
        toast({
          title: "Practice logged successfully!",
          description: "Your progress has been updated.",
        });
        
        // Show badge notification if a new badge was earned
        if (newBadges && newBadges.length > 0) {
          showBadgeNotification(newBadges[0]);
        }
      } else {
        toast({
          title: "Error logging practice",
          description: "There was a problem saving your practice session.",
          variant: "destructive",
        });
      }
    };
    
    saveSession();
  }, [routine.id, blocks, toast, showBadgeNotification]);

  return (
    <div className="container px-4 py-12 mx-auto max-w-4xl">
      <div className="bg-card/30 backdrop-blur-sm rounded-lg border border-white/10 p-6 md:p-8 flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-3">
          Practice Complete!
        </h1>
        
        <p className="text-center text-white/70 mb-6 text-lg">
          You've completed your practice session.
        </p>
        
        <div className="grid gap-4 w-full max-w-md mb-8">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <span className="text-white/70">Session</span>
            <span className="font-semibold">{routine.title}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <span className="text-white/70">Duration</span>
            <span className="font-semibold">{formatDuration(totalDuration)}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <span className="text-white/70">Blocks Completed</span>
            <span className="font-semibold">{blocks.length}</span>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 w-full max-w-2xl">
          <button
            className="flex-1 min-w-0 h-14 bg-gradient-to-r from-music-primary to-music-secondary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-music-primary/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            onClick={() => navigate("/practice")}
          >
            <Music className="w-5 h-5" />
            Return to Practice Studio
          </button>
          
          <button
            className="flex-1 min-w-0 h-14 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border border-white/20 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02] hover:bg-gradient-to-r hover:from-card hover:to-card/80 active:scale-[0.98] flex items-center justify-center gap-3"
            onClick={() => navigate("/practice/history")}
          >
            <History className="w-5 h-5" />
            View Practice History
          </button>
          
          <button
            className="flex-1 min-w-0 h-14 bg-gradient-to-r from-music-accent/80 to-music-accent/60 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-music-accent/25 hover:scale-[1.02] hover:from-music-accent hover:to-music-accent/80 active:scale-[0.98] flex items-center justify-center gap-3"
            onClick={() => navigate("/dashboard")}
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeCompletionScreen;
