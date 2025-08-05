import React, { useState, useEffect } from 'react';
import { Play, Pause, Trash2, Calendar, Clock, Tag, FileAudio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { recordingService } from '@/services/recordingService';
import { PracticeRecording } from '@/types/recording';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RecordingsListProps {
  className?: string;
  maxItems?: number;
}

const RecordingsList: React.FC<RecordingsListProps> = ({ className, maxItems }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<PracticeRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (user) {
      fetchRecordings();
    }
  }, [user]);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const fetchRecordings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await recordingService.fetchUserRecordings(user.id);
      setRecordings(maxItems ? data.slice(0, maxItems) : data);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      toast({
        title: "Error",
        description: "Could not load your recordings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = (recording: PracticeRecording) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      if (playingId === recording.id) {
        setPlayingId(null);
        setCurrentAudio(null);
        return;
      }
    }

    // Start new audio
    const audio = new Audio(recording.recording_url);
    audio.addEventListener('ended', () => {
      setPlayingId(null);
      setCurrentAudio(null);
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      toast({
        title: "Playback Error",
        description: "Could not play this recording.",
        variant: "destructive"
      });
      setPlayingId(null);
      setCurrentAudio(null);
    });

    audio.play();
    setPlayingId(recording.id);
    setCurrentAudio(audio);
  };

  const handleDelete = async (recordingId: string) => {
    try {
      await recordingService.deleteRecording(recordingId);
      setRecordings(prev => prev.filter(r => r.id !== recordingId));
      
      // Stop audio if this recording was playing
      if (playingId === recordingId && currentAudio) {
        currentAudio.pause();
        setPlayingId(null);
        setCurrentAudio(null);
      }

      toast({
        title: "Recording Deleted",
        description: "The recording has been permanently deleted.",
      });
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete the recording.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className={`border-white/10 bg-card/50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            My Recordings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-white/5 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recordings.length === 0) {
    return (
      <Card className={`border-white/10 bg-card/50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            My Recordings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileAudio className="h-12 w-12 mx-auto text-white/40 mb-4" />
            <p className="text-white/60">No practice recordings yet</p>
            <p className="text-sm text-white/40 mt-1">
              Start recording your practice sessions to track your progress
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-white/10 bg-card/50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="h-5 w-5" />
          My Recordings ({recordings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recordings.map((recording) => (
          <div
            key={recording.id}
            className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{recording.title}</h3>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(recording.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(recording.duration_seconds)}
                  </div>
                </div>

                {recording.notes && (
                  <p className="text-sm text-white/70 mt-2 line-clamp-2">
                    {recording.notes}
                  </p>
                )}

                {recording.tags && recording.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <Tag className="h-3 w-3 text-white/40" />
                    <div className="flex flex-wrap gap-1">
                      {recording.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {recording.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{recording.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handlePlayPause(recording)}
                  size="sm"
                  variant="outline"
                  className="border-white/20"
                >
                  {playingId === recording.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Recording</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{recording.title}"? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(recording.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecordingsList;