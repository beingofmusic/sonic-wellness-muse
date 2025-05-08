
import { useState, useRef, useCallback, useEffect } from "react";
import { formatTime } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";

export const useRoutineTimer = (onTimerComplete: () => void) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("00:00");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Cleanup function to clear the timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
  }, []);

  // Start the timer with a specific duration in seconds
  const startTimer = useCallback(() => {
    // Clear any existing timers first
    clearTimer();
    
    console.log("Starting timer with", secondsLeft, "seconds left");
    
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // Timer reached zero, clear the interval
          clearTimer();
          
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
    
    setIsActive(true);
  }, [onTimerComplete, secondsLeft, clearTimer]);

  // Set timer duration and optionally start it
  const setTimer = useCallback((durationInSeconds: number, autoStart = true) => {
    console.log("Setting timer to", durationInSeconds, "seconds, autoStart:", autoStart);
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
      
      console.log("Toggle pause, new state:", newPausedState);
      
      // If resuming, start the timer
      if (!newPausedState) {
        startTimer();
      } else {
        // If pausing, clear the timer
        clearTimer();
      }
      
      return newPausedState;
    });
  }, [startTimer, clearTimer]);

  // Reset timer to the current block's duration
  const resetTimer = useCallback((durationInSeconds: number) => {
    console.log("Resetting timer to", durationInSeconds, "seconds");
    
    // Stop the current timer
    clearTimer();
    
    setSecondsLeft(durationInSeconds);
    setTimeRemaining(formatTime(durationInSeconds));
    
    // Restart the timer if not paused
    if (!isPaused) {
      startTimer();
    }
  }, [isPaused, startTimer, clearTimer]);

  // Effect to ensure timer is properly cleaned up on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  // Add a force start method for recovery scenarios
  const forceStart = useCallback(() => {
    console.log("Force starting timer with", secondsLeft, "seconds");
    setIsPaused(false);
    startTimer();
  }, [secondsLeft, startTimer]);

  return {
    timeRemaining,
    secondsLeft,
    isPaused,
    isActive,
    togglePause,
    setTimer,
    resetTimer,
    clearTimer,
    forceStart
  };
};
