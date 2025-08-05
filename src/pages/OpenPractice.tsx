import React, { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Pause, Square, Mic, X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { logOpenPracticeSession } from "@/services/practiceStatsService";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { recordingService } from "@/services/recordingService";

const OpenPractice: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionTags, setSessionTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording
  } = useAudioRecording();

  // Timer effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isRunning) {
      intervalId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isRunning]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (seconds > 0) {
      setShowCompletionDialog(true);
    } else {
      navigate("/practice");
    }
  };

  const handleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !sessionTags.includes(newTag.trim())) {
      setSessionTags([...sessionTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSessionTags(sessionTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag();
    }
  };

  const saveSession = useCallback(async () => {
    if (!user) return;

    try {
      // Create practice session
      const sessionId = await logOpenPracticeSession(
        user.id,
        Math.floor(seconds / 60), // Convert to minutes
        { type: 'open_practice', tags: sessionTags, notes: sessionNotes }
      );

      // Save recording if exists
      if (audioBlob && sessionId) {
        const recordingTitle = `Open Practice - ${new Date().toLocaleDateString()}`;
        await recordingService.uploadRecording(
          audioBlob,
          user.id,
          { title: recordingTitle, notes: sessionNotes, tags: sessionTags },
          seconds,
          sessionId
        );
      }

      toast({
        title: "Practice session saved!",
        description: `Your ${formatTime(seconds)} open practice session has been logged.`,
      });

      navigate("/practice");
    } catch (error) {
      console.error("Error saving session:", error);
      toast({
        title: "Error saving session",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }, [user, seconds, sessionTags, sessionNotes, audioBlob, toast, navigate]);

  const handleDiscardSession = () => {
    setShowCompletionDialog(false);
    resetRecording();
    navigate("/practice");
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2">Open Practice Session</h1>
          <p className="text-white/70">Freeform practice • No structure needed</p>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-12">
          <div className="text-8xl font-bold mb-4 tracking-tight">
            {formatTime(seconds)}
          </div>
          
          {/* Control Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={handleStartPause}
              size="lg"
              className="bg-gradient-to-r from-music-primary to-music-secondary hover:opacity-90 text-white px-8 h-16 rounded-2xl"
            >
              {isRunning ? <Pause className="mr-2 h-6 w-6" /> : <Play className="mr-2 h-6 w-6" />}
              {isRunning ? "Pause" : "Start"}
            </Button>

            <Button
              onClick={handleStop}
              variant="outline"
              size="lg"
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white px-8 h-16 rounded-2xl"
            >
              <Square className="mr-2 h-6 w-6" />
              Stop
            </Button>

            <Button
              onClick={handleRecording}
              variant={isRecording ? "destructive" : "outline"}
              size="lg"
              className={`px-8 h-16 rounded-2xl ${!isRecording ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white' : ''}`}
            >
              <Mic className="mr-2 h-6 w-6" />
              {isRecording ? "Stop Recording" : "Record"}
            </Button>
          </div>

          {isRecording && (
            <div className="text-red-400 animate-pulse mb-4">
              ● Recording in progress...
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="text-green-400 mb-4">
              ✓ Recording saved ({Math.floor(seconds)} seconds)
            </div>
          )}
        </div>

        {/* Session Completion Dialog */}
        <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
          <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-md border-white/10">
            <DialogHeader>
              <DialogTitle>Complete Your Practice Session</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{formatTime(seconds)}</div>
                <p className="text-white/70">Great work on your open practice session!</p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags (optional)</label>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {sessionTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-music-primary/20">
                      {tag}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag (e.g., improv, warmup, scales)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-white/5 border-white/10"
                  />
                  <Button onClick={addTag} variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Session Notes (optional)</label>
                <Textarea
                  placeholder="How did your practice go? Any insights or areas to work on?"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="bg-white/5 border-white/10"
                  rows={4}
                />
              </div>

              {audioBlob && (
                <div className="p-4 bg-music-primary/10 rounded-lg border border-music-primary/20">
                  <p className="text-sm text-music-primary">
                    ✓ Recording will be saved with this session
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  onClick={handleDiscardSession}
                  variant="outline"
                  className="border-white/20 bg-white/5 hover:bg-white/10"
                >
                  Discard Session
                </Button>
                <Button
                  onClick={saveSession}
                  className="bg-gradient-to-r from-music-primary to-music-secondary hover:opacity-90"
                >
                  Save Session
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default OpenPractice;