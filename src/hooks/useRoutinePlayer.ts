
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
  
  // Timer controls with enhanced initialization
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

  // Immediate initialization when blocks are loaded - highest priority effect
  useEffect(() => {
    if (isLoading || blocks.length === 0) return;
    
    console.log("Blocks loaded, initializing player with first block");
    
    const initialDuration = blocks[0]?.duration * 60; // convert to seconds
    if (!initialDuration || initialDuration <= 0) {
      console.error("Invalid initial duration:", initialDuration);
      return;
    }
    
    // Set the timer with the initial duration
    timerControls.setTimer(initialDuration, true);
    
    // Mark as being in the process of initializing
    if (!initialized) {
      setInitialized(true);
    }
    
    // Double-check timer starts with a slightly longer delay
    const initRecoveryTimer = setTimeout(() => {
      if (!timerControls.isActive && !timerControls.isPaused) {
        console.log("Timer didn't auto-start during init, forcing start");
        timerControls.forceStart();
      }
    }, 500);
    
    return () => clearTimeout(initRecoveryTimer);
  }, [blocks, isLoading, timerControls, initialized]);
  
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

  // Third recovery mechanism - check periodically if timer should be running but isn't
  useEffect(() => {
    if (!initialized || blocks.length === 0) return;
    
    const recoveryInterval = setInterval(() => {
      if (blocks[currentBlockIndex] && !timerControls.isActive && !timerControls.isPaused) {
        console.log("Recovery check: Timer should be running but isn't, restarting");
        timerControls.forceStart();
      }
    }, 2000);
    
    return () => clearInterval(recoveryInterval);
  }, [blocks, currentBlockIndex, timerControls, initialized]);
  
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
