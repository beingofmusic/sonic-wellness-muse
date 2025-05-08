
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoutineData } from "./practice/useRoutineData";
import { useRoutineTimer } from "./practice/useRoutineTimer";
import { useBlockNavigation } from "./practice/useBlockNavigation";
import { useFocusMode } from "./practice/useFocusMode";

export const useRoutinePlayer = (routineId?: string) => {
  const navigate = useNavigate();
  
  // Fetch routine data
  const { isLoading, routine, blocks } = useRoutineData(routineId);
  
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
  
  // Timer controls
  const timerControls = useRoutineTimer(() => {
    // Auto advance to next block when timer completes
    if (currentBlockIndex < blocks.length - 1) {
      handleNext();
    }
  });

  // Focus mode toggle
  const { focusMode, toggleFocusMode } = useFocusMode();

  // Update progress and timer when current block changes
  useEffect(() => {
    updateBlockProgress();
  }, [currentBlockIndex, blocks, updateBlockProgress]);
  
  // Initialize timer with first block's duration
  useEffect(() => {
    if (isLoading || blocks.length === 0) return;
    
    const initialDuration = blocks[0].duration * 60; // convert to seconds
    timerControls.setTimer(initialDuration, !timerControls.isPaused);
  }, [blocks, isLoading, timerControls]);
  
  // Handle reset for current block
  const handleReset = () => {
    if (blocks[currentBlockIndex]) {
      const blockDuration = blocks[currentBlockIndex].duration * 60; // convert to seconds
      timerControls.resetTimer(blockDuration);
    }
  };
  
  // Handle exiting the player
  const handleExit = () => {
    // Clean up timer before navigating away
    timerControls.clearTimer();
    navigate("/practice");
  };
  
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
