
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Award, ArrowRight, Calendar, Check, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PracticeRoutine, RoutineBlock } from "@/types/practice";
import { saveReflection } from "@/services/reflectionService";
import { logPracticeSession } from "@/services/practiceStatsService";
import { useToast } from "@/hooks/use-toast";

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
  const [reflection, setReflection] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [sessionLogged, setSessionLogged] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate total practice time
  const totalPracticeMinutes = blocks.reduce((total, block) => total + block.duration, 0);
  
  const formatTime = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  // Log the practice session once when component mounts
  useEffect(() => {
    const logSession = async () => {
      if (!sessionLogged) {
        const success = await logPracticeSession(routine.id, totalPracticeMinutes, blocks);
        if (success) {
          setSessionLogged(true);
          console.log("Practice session logged successfully");
        }
      }
    };

    logSession();
  }, [routine.id, totalPracticeMinutes, blocks, sessionLogged]);

  const handleSaveReflection = async () => {
    if (!reflection.trim()) return;
    
    setIsSaving(true);
    const success = await saveReflection(routine.id, reflection);
    
    if (success) {
      toast({
        title: "Reflection saved",
        description: "Your practice reflection has been saved successfully.",
      });
      setReflectionSaved(true);
    } else {
      toast({
        title: "Error saving reflection",
        description: "There was a problem saving your reflection. Please try again.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const handleNavigate = (path: string) => {
    if (reflection.trim() && !reflectionSaved) {
      if (confirm("You have an unsaved reflection. Save before leaving?")) {
        handleSaveReflection().then(() => navigate(path));
      } else {
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto animate-fade-in">
      {/* Header with celebration */}
      <div className="text-center mb-8">
        <div className="inline-block rounded-full bg-music-primary/20 p-4 mb-4">
          <Award className="h-12 w-12 text-music-primary" />
        </div>
        <h1 className="text-3xl font-semibold mb-2">Practice Complete!</h1>
        <p className="text-white/70">
          Congratulations on completing your practice session.
        </p>
      </div>
      
      {/* Practice summary */}
      <div className="bg-white/5 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-medium mb-4 flex items-center">
          <Check className="h-5 w-5 mr-2 text-music-primary" />
          Session Summary
        </h2>
        
        <div className="flex justify-between mb-4 pb-4 border-b border-white/10">
          <span className="text-white/70">Total Time</span>
          <span className="font-semibold">{formatTime(totalPracticeMinutes)}</span>
        </div>
        
        <h3 className="text-sm text-white/70 mb-2">Practice Blocks</h3>
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <div key={block.id} className="flex justify-between text-sm">
              <span className="flex items-center">
                <span className="w-5 h-5 bg-music-primary/20 rounded-full flex items-center justify-center mr-2 text-xs">
                  {index + 1}
                </span>
                {block.type}
              </span>
              <span>{formatTime(block.duration)}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Reflection section */}
      <div className="bg-white/5 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-medium mb-4">Practice Reflection</h2>
        <p className="text-sm text-white/70 mb-4">
          Take a moment to reflect on your practice session. What worked well? What didn't?
          What would you like to focus on next time?
        </p>
        
        <Textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Share your thoughts on today's practice..."
          className="mb-4 min-h-[120px] bg-white/5"
        />
        
        <Button 
          onClick={handleSaveReflection} 
          disabled={!reflection.trim() || isSaving || reflectionSaved}
          className="w-full md:w-auto"
        >
          {isSaving ? "Saving..." : reflectionSaved ? "Saved!" : "Save Reflection"}
        </Button>
      </div>
      
      {/* Navigation options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant="outline"
          className="flex items-center justify-center gap-2"
          onClick={() => handleNavigate("/dashboard")}
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Button>
        
        <Button 
          variant="outline"
          className="flex items-center justify-center gap-2"
          onClick={() => handleNavigate("/calendar")}
        >
          <Calendar className="h-4 w-4" />
          Practice History
        </Button>
        
        <Button 
          className="flex items-center justify-center gap-2 bg-music-primary hover:bg-music-secondary"
          onClick={onStartNewSession}
        >
          <ArrowRight className="h-4 w-4" />
          New Session
        </Button>
      </div>
    </div>
  );
};

export default PracticeCompletionScreen;
