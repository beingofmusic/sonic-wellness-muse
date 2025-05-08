
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
    timerControls.setTimer(seconds, !timerControls.isPaused);
  });

  // Focus mode toggle
  const { focusMode, toggleFocusMode } = useFocusMode();

  // Initialize timer with the first block's duration after data loads
  useEffect(() => {
    if (isLoading || blocks.length === 0 || initialized) return;
    
    const initialDuration = blocks[0].duration * 60; // convert to seconds
    console.log("Initializing timer with duration:", initialDuration);
    
    // Short delay to ensure components are mounted
    const initTimer = setTimeout(() => {
      timerControls.setTimer(initialDuration, true);
      setInitialized(true);
      
      // Make sure the timer started
      setTimeout(() => {
        if (!timerControls.isActive && !timerControls.isPaused) {
          console.log("Timer didn't start automatically, forcing start");
          timerControls.forceStart();
        }
      }, 500);
    }, 300);
    
    return () => clearTimeout(initTimer);
  }, [blocks, isLoading, timerControls, initialized]);
  
  // Update progress and timer when current block changes
  useEffect(() => {
    if (!initialized) return;
    updateBlockProgress();
  }, [currentBlockIndex, blocks, updateBlockProgress, initialized]);
  
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
