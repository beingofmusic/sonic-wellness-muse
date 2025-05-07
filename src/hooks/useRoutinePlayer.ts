
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PracticeRoutine, RoutineBlock } from "@/types/practice";
import { fetchRoutineById, fetchRoutineBlocks } from "@/services/practiceService";
import { useToast } from "@/hooks/use-toast";
import { formatTime } from "@/lib/formatters";

export const useRoutinePlayer = (routineId?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [routine, setRoutine] = useState<PracticeRoutine | null>(null);
  const [blocks, setBlocks] = useState<RoutineBlock[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string>("00:00");
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch routine and block data
  useEffect(() => {
    const fetchRoutineData = async () => {
      if (!routineId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const routineData = await fetchRoutineById(routineId);
        const blocksData = await fetchRoutineBlocks(routineId);
        
        setRoutine(routineData);
        setBlocks(blocksData);
        
        // Initialize timer with first block's duration
        if (blocksData.length > 0) {
          const initialDuration = blocksData[0].duration * 60; // convert to seconds
          setTimeRemaining(formatTime(initialDuration));
        }
      } catch (error) {
        console.error("Error fetching routine data:", error);
        toast({
          title: "Error",
          description: "Failed to load routine data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutineData();
  }, [routineId, toast]);

  // Update session progress when current block changes
  useEffect(() => {
    if (blocks.length === 0) return;
    
    const progress = ((currentBlockIndex + 1) / blocks.length) * 100;
    setSessionProgress(progress);
    
    // Update timer for the new block
    if (blocks[currentBlockIndex]) {
      const blockDuration = blocks[currentBlockIndex].duration * 60; // convert to seconds
      setTimeRemaining(formatTime(blockDuration));
    }
  }, [currentBlockIndex, blocks]);

  // Handle navigation between blocks
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
  }, [currentBlockIndex, blocks.length, toast]);

  const handlePrevious = useCallback(() => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(prevIndex => prevIndex - 1);
    }
  }, [currentBlockIndex]);

  // Handle timer controls
  const handleReset = useCallback(() => {
    const currentBlock = blocks[currentBlockIndex];
    if (currentBlock) {
      const blockDuration = currentBlock.duration * 60; // convert to seconds
      setTimeRemaining(formatTime(blockDuration));
    }
  }, [blocks, currentBlockIndex]);

  const handlePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev);
  }, []);

  const handleExit = useCallback(() => {
    navigate("/practice");
  }, [navigate]);

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
    handlePause,
    isPaused,
    timeRemaining,
    focusMode,
    toggleFocusMode,
    handleExit
  };
};
