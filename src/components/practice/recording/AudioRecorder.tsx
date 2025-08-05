import React, { useState } from 'react';
import { Mic, Square, Pause, Play, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { recordingService } from '@/services/recordingService';
import { RecordingFormData } from '@/types/recording';
import RecordingSaveDialog from './RecordingSaveDialog';

interface AudioRecorderProps {
  sessionId?: string;
  className?: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ sessionId, className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    isSupported
  } = useAudioRecording();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to record your practice session.",
        variant: "destructive"
      });
      return;
    }

    try {
      await startRecording();
      toast({
        title: "Recording Started",
        description: "Your practice session is now being recorded.",
      });
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Recording Failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const handleStopRecording = async () => {
    console.log('Stopping recording...');
    await stopRecording();
    console.log('Recording stopped, audio blob:', audioBlob);
    
    // Wait a moment for the blob to be processed
    setTimeout(() => {
      console.log('Opening save dialog, blob available:', !!audioBlob);
      setShowSaveDialog(true);
    }, 100);
  };

  const handleSaveRecording = async (formData: RecordingFormData) => {
    console.log('Attempting to save recording...', { 
      hasBlob: !!audioBlob, 
      blobSize: audioBlob?.size, 
      hasUser: !!user,
      userId: user?.id,
      sessionId,
      formData 
    });

    if (!audioBlob || !user) {
      console.error('Save failed: Missing blob or user', { hasBlob: !!audioBlob, hasUser: !!user });
      toast({
        title: "Save Failed",
        description: "No recording data or user not authenticated.",
        variant: "destructive"
      });
      return;
    }

    if (audioBlob.size === 0) {
      console.error('Save failed: Empty audio blob');
      toast({
        title: "Save Failed",
        description: "Recording appears to be empty. Please try recording again.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log('Calling recordingService.uploadRecording...');
      const result = await recordingService.uploadRecording(audioBlob, user.id, formData, duration);
      console.log('Upload successful:', result);
      
      toast({
        title: "Recording Saved",
        description: "Your practice recording has been saved successfully.",
      });
      
      resetRecording();
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Could not save recording. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSave = () => {
    setShowSaveDialog(false);
    resetRecording();
  };

  if (!isSupported) {
    return (
      <Card className={`border-white/10 bg-card/50 ${className}`}>
        <CardContent className="p-4">
          <p className="text-white/60 text-sm text-center">
            Audio recording is not supported in this browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`border-white/10 bg-card/50 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Record Practice Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Status */}
          {(isRecording || isPaused) && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                {isRecording && !isPaused && (
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
                {isPaused && (
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                )}
                <span className="text-sm font-medium">
                  {isPaused ? 'Paused' : 'Recording'}
                </span>
              </div>
              <span className="text-lg font-mono">
                {formatTime(duration)}
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {!isRecording && !isPaused && (
              <Button
                onClick={handleStartRecording}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            )}

            {isRecording && !isPaused && (
              <>
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  className="border-white/20"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button
                  onClick={handleStopRecording}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Stop & Save
                </Button>
              </>
            )}

            {isPaused && (
              <>
                <Button
                  onClick={resumeRecording}
                  variant="outline"
                  className="border-white/20"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
                <Button
                  onClick={handleStopRecording}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Stop & Save
                </Button>
              </>
            )}
          </div>

          {/* Reset button */}
          {(isRecording || isPaused || audioBlob) && (
            <Button
              onClick={resetRecording}
              variant="ghost"
              size="sm"
              className="w-full text-white/60 hover:text-white"
            >
              <Square className="h-4 w-4 mr-2" />
              Cancel Recording
            </Button>
          )}
        </CardContent>
      </Card>

      <RecordingSaveDialog
        open={showSaveDialog}
        onSave={handleSaveRecording}
        onCancel={handleCancelSave}
        duration={duration}
        isSaving={isSaving}
      />
    </>
  );
};

export default AudioRecorder;