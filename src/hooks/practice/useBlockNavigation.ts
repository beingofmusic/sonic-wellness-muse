
import { useState, useCallback } from "react";
import { RoutineBlock } from "@/types/practice";
import { useToast } from "@/hooks/use-toast";

export const useBlockNavigation = (
  blocks: RoutineBlock[],
  onTimerReset: (seconds: number) => void
) => {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);
  const { toast } = useToast();

  // Update session progress when current block changes
  const updateBlockProgress = useCallback(() => {
    if (blocks.length === 0) return;
    
    // Calculate overall progress percentage
    const progress = ((currentBlockIndex + 1) / blocks.length) * 100;
    setSessionProgress(progress);
    
    // Update timer for the new block if available
    if (blocks[currentBlockIndex]) {
      const blockDuration = blocks[currentBlockIndex].duration * 60; // convert to seconds
      onTimerReset(blockDuration);
    }
  }, [blocks, currentBlockIndex, onTimerReset]);

  // Handle navigation to next block
  const handleNext = useCallback(() => {
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex(prevIndex => prevIndex + 1);
    } else {
      // Show completion state
      toast({
        title: "Session Complete",
        description: "Congratulations on completing your practice session!",
      });
    }
  }, [blocks.length, currentBlockIndex, toast]);

  // Handle navigation to previous block
  const handlePrevious = useCallback(() => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(prevIndex => prevIndex - 1);
    }
  }, [currentBlockIndex]);

  return {
    currentBlockIndex,
    setCurrentBlockIndex,
    sessionProgress,
    handleNext,
    handlePrevious,
    updateBlockProgress
  };
};
