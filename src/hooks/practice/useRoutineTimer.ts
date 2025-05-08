
import { useState, useRef, useCallback } from "react";
import { formatTime } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";

export const useRoutineTimer = (onTimerComplete: () => void) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("00:00");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Start the timer with a specific duration in seconds
  const startTimer = useCallback(() => {
    // Clear any existing timers first
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // Timer reached zero, clear the interval
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          
          // Call the completion callback
          onTimerComplete();
          
          return 0;
        }
        
        // Update the formatted time display
        const newTime = prev - 1;
        setTimeRemaining(formatTime(newTime));
        return newTime;
      });
    }, 1000);
  }, [onTimerComplete]);

  // Set timer duration and optionally start it
  const setTimer = useCallback((durationInSeconds: number, autoStart = true) => {
    setSecondsLeft(durationInSeconds);
    setTimeRemaining(formatTime(durationInSeconds));
    
    if (autoStart && !isPaused) {
      startTimer();
    }
  }, [isPaused, startTimer]);

  // Handle pausing and resuming the timer
  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      const newPausedState = !prev;
      
      // If resuming, start the timer
      if (!newPausedState) {
        startTimer();
      } else {
        // If pausing, clear the timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      
      return newPausedState;
    });
  }, [startTimer]);

  // Reset timer to the current block's duration
  const resetTimer = useCallback((durationInSeconds: number) => {
    // Stop the current timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setSecondsLeft(durationInSeconds);
    setTimeRemaining(formatTime(durationInSeconds));
    
    // Restart the timer if not paused
    if (!isPaused) {
      startTimer();
    }
  }, [isPaused, startTimer]);

  // Cleanup function to clear the timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    timeRemaining,
    secondsLeft,
    isPaused,
    togglePause,
    setTimer,
    resetTimer,
    clearTimer
  };
};
