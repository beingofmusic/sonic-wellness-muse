
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRoutineData } from "./practice/useRoutineData";
import { useRoutineTimer } from "./practice/useRoutineTimer";
import { useBlockNavigation } from "./practice/useBlockNavigation";
import { useFocusMode } from "./practice/useFocusMode";
import { useToast } from "./use-toast";

export const useRoutinePlayer = (routineId?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  
  // Fetch routine data
  const { isLoading, routine, blocks } = useRoutineData(routineId);
  
  // Timer controls
  const timerControls = useRoutineTimer(() => {
    // Auto advance to next block when timer completes
    if (currentBlockIndex < blocks.length - 1) {
      handleNext();
    }
  });
  
  // Block navigation hooks
  const {
    currentBlockIndex,
    setCurrentBlockIndex,
    sessionProgress,
    handleNext,
    handlePrevious,
    updateBlockProgress
  } = useBlockNavigation(blocks, (seconds) => {
    timerControls.setTimer(seconds, true); // Always try to auto-start
  });

  // Focus mode toggle
  const { focusMode, toggleFocusMode } = useFocusMode();

  // Initialize timer when blocks are loaded
  useEffect(() => {
    // Only initialize if we have blocks and aren't already initialized
    if (isLoading || blocks.length === 0) return;
    
    // Reset initialization if blocks change
    if (initialized) {
      setInitialized(false);
      return;
    }
    
    const initialDuration = blocks[0]?.duration * 60; // convert to seconds
    console.log("Initializing timer with duration:", initialDuration);
    
    if (!initialDuration || initialDuration <= 0) {
      console.error("Invalid initial duration:", initialDuration);
      return;
    }
    
    // Initialize timer with a delay to ensure proper component mounting
    const initTimer = setTimeout(() => {
      // Explicitly set paused state to false to ensure it starts
      timerControls.setTimer(initialDuration, true);
      
      // Mark as initialized so we don't re-initialize
      setInitialized(true);
      
      // Add a further check to ensure timer starts correctly
      const recoveryTimer = setTimeout(() => {
        if (!timerControls.isActive && !timerControls.isPaused) {
          console.log("Timer didn't start automatically, forcing start");
          timerControls.forceStart();
        }
      }, 1000); // Longer delay for recovery
      
      return () => clearTimeout(recoveryTimer);
    }, 300);
    
    return () => clearTimeout(initTimer);
  }, [blocks, isLoading, timerControls]);
  
  // Update progress and timer when current block changes
  useEffect(() => {
    if (!initialized || blocks.length === 0) return;
    
    console.log("Block changed to", currentBlockIndex, "updating progress");
    updateBlockProgress();
    
    // Verify timer is running after block change
    const checkTimer = setTimeout(() => {
      if (!timerControls.isActive && !timerControls.isPaused) {
        console.log("Timer not active after block change, restarting");
        const blockDuration = blocks[currentBlockIndex]?.duration * 60;
        if (blockDuration > 0) {
          timerControls.forceStart();
        }
      }
    }, 500);
    
    return () => clearTimeout(checkTimer);
  }, [currentBlockIndex, blocks, updateBlockProgress, initialized, timerControls]);
  
  // Handle reset for current block
  const handleReset = useCallback(() => {
    if (blocks[currentBlockIndex]) {
      const blockDuration = blocks[currentBlockIndex].duration * 60; // convert to seconds
      timerControls.resetTimer(blockDuration);
    }
  }, [blocks, currentBlockIndex, timerControls]);
  
  // Handle exiting the player
  const handleExit = useCallback(() => {
    // Clean up timer before navigating away
    timerControls.clearTimer();
    navigate("/practice");
  }, [navigate, timerControls]);
  
  return {
    isLoading,
    routine,
    blocks,
    currentBlockIndex,
    sessionProgress,
    setCurrentBlockIndex,
    handleNext,
    handlePrevious,
    handleReset,
    handlePause: timerControls.togglePause,
    isPaused: timerControls.isPaused,
    timeRemaining: timerControls.timeRemaining,
    secondsLeft: timerControls.secondsLeft,
    focusMode,
    toggleFocusMode,
    handleExit
  };
};
