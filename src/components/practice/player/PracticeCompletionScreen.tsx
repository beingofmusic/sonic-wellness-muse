
import React, { useEffect } from "react";
import { PracticeRoutine, RoutineBlock } from "@/types/practice";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle } from "lucide-react";
import { logPracticeSession } from "@/services/practiceStatsService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useBadgeNotificationContext } from "@/context/BadgeNotificationContext";

interface PracticeCompletionScreenProps {
  routine: PracticeRoutine;
  blocks: RoutineBlock[];
  onStartNewSession: () => void;
}

const PracticeCompletionScreen: React.FC<PracticeCompletionScreenProps> = ({
  routine,
  blocks,
  onStartNewSession,
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
        blocks
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
        
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
          <Button
            variant="default"
            size="lg"
            className="flex-1"
            onClick={onStartNewSession}
          >
            Practice Again
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => navigate("/practice")}
          >
            Return to Practice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PracticeCompletionScreen;
