
import { useState, useRef, useCallback, useEffect } from "react";
import { formatTime } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";

export const useRoutineTimer = (onTimerComplete: () => void) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("00:00");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef(0); // Reference to store the current duration
  const { toast } = useToast();

  // Cleanup function to clear the timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
  }, []);

  // Start the timer with the duration stored in durationRef
  const startTimer = useCallback(() => {
    // Clear any existing timers first
    clearTimer();
    
    console.log("Starting timer with", durationRef.current, "seconds");
    
    // Use the durationRef value to ensure we have the latest value
    if (durationRef.current <= 0) {
      console.error("Attempted to start timer with invalid duration:", durationRef.current);
      return;
    }
    
    // Update the seconds left and formatted time immediately
    setSecondsLeft(durationRef.current);
    setTimeRemaining(formatTime(durationRef.current));
    
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
  }, [onTimerComplete, clearTimer]);

  // Set timer duration and optionally start it
  const setTimer = useCallback((durationInSeconds: number, autoStart = true) => {
    console.log("Setting timer to", durationInSeconds, "seconds, autoStart:", autoStart);
    
    if (durationInSeconds <= 0) {
      console.error("Invalid duration provided:", durationInSeconds);
      return;
    }
    
    // Store the duration in the ref for stable access
    durationRef.current = durationInSeconds;
    
    // Update state
    setSecondsLeft(durationInSeconds);
    setTimeRemaining(formatTime(durationInSeconds));
    
    if (autoStart && !isPaused) {
      // Small delay to ensure state updates before starting
      setTimeout(() => {
        startTimer();
      }, 50);
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
    
    if (durationInSeconds <= 0) {
      console.error("Invalid duration provided to resetTimer:", durationInSeconds);
      return;
    }
    
    // Stop the current timer
    clearTimer();
    
    // Store the duration in the ref
    durationRef.current = durationInSeconds;
    
    // Update state
    setSecondsLeft(durationInSeconds);
    setTimeRemaining(formatTime(durationInSeconds));
    
    // Restart the timer if not paused
    if (!isPaused) {
      setTimeout(() => {
        startTimer();
      }, 50);
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
    // Make sure we have a valid duration before force starting
    if (durationRef.current <= 0 && secondsLeft > 0) {
      durationRef.current = secondsLeft;
    }
    
    console.log("Force starting timer with", durationRef.current, "seconds");
    
    if (durationRef.current <= 0) {
      console.error("Cannot force start timer with invalid duration");
      return;
    }
    
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
