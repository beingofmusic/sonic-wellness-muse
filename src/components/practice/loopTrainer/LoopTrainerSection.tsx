import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, RotateCcw, Save, RefreshCw, Youtube, Clock, Zap, Music, Loader2 } from "lucide-react";
import { LoopTrainerControls, YouTubePlayerState } from "@/types/loopTrainer";

// Declare YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
interface LoopTrainerSectionProps {
  onSaveSession?: (sessionData: any) => Promise<any>;
}
const LoopTrainerSection: React.FC<LoopTrainerSectionProps> = ({
  onSaveSession
}) => {
  const {
    toast
  } = useToast();
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [videoId, setVideoId] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [sessionNotes, setSessionNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [playerState, setPlayerState] = useState<YouTubePlayerState>({
    isReady: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1
  });
  const [controls, setControls] = useState<LoopTrainerControls>({
    isLooping: false,
    hasLooped: false,
    loopCount: 0,
    startTime: 0,
    endTime: 30,
    speed: 1,
    pitch: 0
  });

  // Load YouTube API
  useEffect(() => {
    if (window.YT) {
      setIsAPIReady(true);
      return;
    }
    window.onYouTubeIframeAPIReady = () => {
      setIsAPIReady(true);
    };
    if (!document.querySelector('script[src*="youtube"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }
  }, []);

  // Extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Load video
  const loadVideo = useCallback(() => {
    const id = extractVideoId(youtubeUrl);
    if (!id) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive"
      });
      return;
    }
    if (!isAPIReady) {
      toast({
        title: "Loading...",
        description: "YouTube player is still loading, please wait."
      });
      return;
    }
    setVideoId(id);
    if (playerRef.current) {
      playerRef.current.destroy();
    }
    playerRef.current = new window.YT.Player('youtube-player', {
      height: '240',
      width: '100%',
      videoId: id,
      playerVars: {
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0
      },
      events: {
        onReady: (event: any) => {
          const duration = event.target.getDuration();
          setPlayerState(prev => ({
            ...prev,
            isReady: true,
            duration
          }));
          setControls(prev => ({
            ...prev,
            endTime: Math.min(30, duration)
          }));

          // Get video title
          try {
            const title = event.target.getVideoData().title;
            setVideoTitle(title || "Untitled Video");
          } catch (error) {
            console.warn("Could not get video title:", error);
            setVideoTitle("Untitled Video");
          }
          toast({
            title: "Video loaded!",
            description: "You can now set loop points and start practicing."
          });
        },
        onStateChange: (event: any) => {
          const isPlaying = event.data === window.YT.PlayerState.PLAYING;
          console.log('🎵 Player state changed:', isPlaying ? 'PLAYING' : 'PAUSED');
          setPlayerState(prev => ({
            ...prev,
            isPlaying
          }));
        }
      }
    });
  }, [youtubeUrl, isAPIReady, toast]);

  // Stop time tracking function
  const stopTimeTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Continuous time monitoring with proper loop logic
  useEffect(() => {
    if (!playerRef.current || !playerState.isPlaying) {
      stopTimeTracking();
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        
        // Update current time state
        setPlayerState(prev => ({
          ...prev,
          currentTime
        }));

        // Debug logging
        console.log('Loop Trainer Debug:', {
          currentTime: currentTime.toFixed(2),
          startTime: controls.startTime.toFixed(2),
          endTime: controls.endTime.toFixed(2),
          isLooping: controls.isLooping,
          loopCount: controls.loopCount
        });

        // Loop logic with current state values
        if (controls.isLooping && currentTime >= controls.endTime && controls.endTime > controls.startTime) {
          console.log('🔄 Triggering loop! Seeking to:', controls.startTime);
          
          // Seek to start time
          playerRef.current.seekTo(controls.startTime, true);
          
          // Update loop count and hasLooped state
          setControls(prev => ({
            ...prev,
            loopCount: prev.loopCount + 1,
            hasLooped: true
          }));
        }
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playerState.isPlaying, controls.isLooping, controls.startTime, controls.endTime]);

  // Control functions
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playerState.isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };
  const seekToStart = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(controls.startTime, true);
  };
  const toggleLoop = () => {
    const newLoopState = !controls.isLooping;
    console.log('🔄 Loop toggled:', newLoopState ? 'ON' : 'OFF');
    
    setControls(prev => ({
      ...prev,
      isLooping: newLoopState,
      loopCount: 0,
      hasLooped: false
    }));
    
    // When enabling loop mode, seek to start time
    if (newLoopState && playerRef.current) {
      console.log('🎯 Seeking to start time:', controls.startTime);
      playerRef.current.seekTo(controls.startTime, true);
    }
  };
  const updateSpeed = (newSpeed: number[]) => {
    const speed = newSpeed[0];
    setControls(prev => ({
      ...prev,
      speed
    }));
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      playerRef.current.setPlaybackRate(speed);
    }
  };
  const updateStartTime = (time: number[]) => {
    setControls(prev => ({
      ...prev,
      startTime: time[0]
    }));
  };
  const updateEndTime = (time: number[]) => {
    setControls(prev => ({
      ...prev,
      endTime: time[0]
    }));
  };
  const updatePitch = (pitch: number[]) => {
    setControls(prev => ({
      ...prev,
      pitch: pitch[0]
    }));
    // Note: Pitch shifting would require Web Audio API implementation
    // For now, we'll just store the value
  };

  // Save session
  const saveSession = async () => {
    if (!videoId || !onSaveSession) return;
    setIsSaving(true);
    try {
      const sessionData = {
        youtube_url: youtubeUrl,
        video_title: videoTitle,
        start_time_sec: Math.floor(controls.startTime),
        end_time_sec: Math.floor(controls.endTime),
        playback_speed: controls.speed,
        pitch_shift: controls.pitch,
        loop_count: controls.loopCount,
        total_practice_time: Math.floor((controls.endTime - controls.startTime) * controls.loopCount / controls.speed),
        session_notes: sessionNotes || null
      };
      await onSaveSession(sessionData);
      toast({
        title: "Session saved!",
        description: "Your loop trainer session has been saved to your practice history."
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save your session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopTimeTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [stopTimeTracking]);
  return <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Youtube className="h-5 w-5 text-red-500" />
        <h4 className="font-medium">Loop & Slow-down tool</h4>
      </div>

      {/* YouTube URL Input */}
      <div className="space-y-2">
        <Label htmlFor="youtube-url">YouTube URL</Label>
        <div className="flex gap-2">
          <Input id="youtube-url" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} className="flex-1" />
          <Button onClick={loadVideo} disabled={!youtubeUrl || !isAPIReady}>
            {!isAPIReady ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load"}
          </Button>
        </div>
      </div>

      {/* Video Player */}
      {videoId && <div className="bg-black rounded-lg overflow-hidden">
          <div id="youtube-player"></div>
        </div>}

      {/* Controls */}
      {playerState.isReady && <div className="space-y-6">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button onClick={togglePlay} variant="outline" size="sm">
              {playerState.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button onClick={seekToStart} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 ml-4">
              <Switch checked={controls.isLooping} onCheckedChange={toggleLoop} id="loop-mode" />
              <Label htmlFor="loop-mode" className="text-sm">
                Loop Mode {controls.isLooping && `(${controls.loopCount} loops)`}
              </Label>
            </div>
            {/* Current Time Display */}
            <div className="ml-auto text-sm text-muted-foreground">
              {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
            </div>
          </div>

          {/* Time Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Start Time: {formatTime(controls.startTime)}
              </Label>
              <Slider value={[controls.startTime]} onValueChange={updateStartTime} max={playerState.duration} step={0.1} className="mt-2" />
            </div>
            <div>
              <Label className="text-sm flex items-center gap-1">
                <Clock className="h-4 w-4" />
                End Time: {formatTime(controls.endTime)}
              </Label>
              <Slider value={[controls.endTime]} onValueChange={updateEndTime} max={playerState.duration} step={0.1} className="mt-2" />
            </div>
          </div>

          {/* Speed and Pitch Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Speed: {controls.speed.toFixed(2)}x
              </Label>
              <Slider value={[controls.speed]} onValueChange={updateSpeed} min={0.25} max={2} step={0.05} className="mt-2" />
            </div>
            <div>
              <Label className="text-sm flex items-center gap-1">
                <Music className="h-4 w-4" />
                Pitch: {controls.pitch > 0 ? '+' : ''}{controls.pitch} semitones
              </Label>
              <Slider value={[controls.pitch]} onValueChange={updatePitch} min={-12} max={12} step={1} className="mt-2" />
            </div>
          </div>

          {/* Session Notes */}
          <div>
            <Label htmlFor="session-notes" className="text-sm">Session Notes</Label>
            <Textarea id="session-notes" placeholder="Add notes about your practice session..." value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} className="mt-1 min-h-[60px]" />
          </div>

          {/* Save Button */}
          {onSaveSession && <Button onClick={saveSession} disabled={isSaving || !controls.hasLooped} className="w-full">
              {isSaving ? <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </> : <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Session
                </>}
            </Button>}

          {/* Practice Stats */}
          {controls.hasLooped && <div className="bg-music-primary/10 rounded-lg p-4">
              <h5 className="font-medium mb-2">Practice Stats</h5>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-white/70">Loops</div>
                  <div className="font-medium">{controls.loopCount}</div>
                </div>
                <div>
                  <div className="text-white/70">Loop Duration</div>
                  <div className="font-medium">{formatTime(controls.endTime - controls.startTime)}</div>
                </div>
                <div>
                  <div className="text-white/70">Total Time</div>
                  <div className="font-medium">
                    {formatTime((controls.endTime - controls.startTime) * controls.loopCount / controls.speed)}
                  </div>
                </div>
              </div>
            </div>}
        </div>}
    </div>;
};
export default LoopTrainerSection;