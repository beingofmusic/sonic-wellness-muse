
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PracticeRoutine, RoutineBlock } from "@/types/practice";
import { checkRoutineAccess, fetchRoutineBlocks } from "@/services/practiceService";
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
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Fetch routine and block data
  useEffect(() => {
    const fetchRoutineData = async () => {
      if (!routineId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Check if user has access to this routine (handles both public and private routines)
        const { hasAccess, routine: routineData } = await checkRoutineAccess(routineId);
        
        if (!hasAccess || !routineData) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this routine or it doesn't exist",
            variant: "destructive",
          });
          navigate("/practice");
          return;
        }

        const blocksData = await fetchRoutineBlocks(routineId);
        
        setRoutine(routineData);
        setBlocks(blocksData);
        
        // Initialize timer with first block's duration
        if (blocksData.length > 0) {
          const initialDuration = blocksData[0].duration * 60; // convert to seconds
          setSecondsLeft(initialDuration);
          setTimeRemaining(formatTime(initialDuration));
        }
      } catch (error) {
        console.error("Error fetching routine data:", error);
        toast({
          title: "Error",
          description: "Failed to load routine data",
          variant: "destructive",
        });
        navigate("/practice");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutineData();
  }, [routineId, toast, navigate]);

  // Start countdown timer when blocks load and not paused
  useEffect(() => {
    if (blocks.length === 0 || isLoading || isPaused) return;
    
    // Start the timer
    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [blocks, isLoading, isPaused]);

  // Update session progress when current block changes
  useEffect(() => {
    if (blocks.length === 0) return;
    
    const progress = ((currentBlockIndex + 1) / blocks.length) * 100;
    setSessionProgress(progress);
    
    // Update timer for the new block
    if (blocks[currentBlockIndex]) {
      const blockDuration = blocks[currentBlockIndex].duration * 60; // convert to seconds
      setSecondsLeft(blockDuration);
      setTimeRemaining(formatTime(blockDuration));
      
      // Auto-start timer for the new block if not paused
      if (!isPaused) {
        startTimer();
      }
    }
  }, [currentBlockIndex, blocks]);

  // Timer function
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
          
          // Auto advance to next block
          if (currentBlockIndex < blocks.length - 1) {
            setCurrentBlockIndex(prevIndex => prevIndex + 1);
          } else {
            // Show completion state for the last block
            setIsCompleted(true);
            toast({
              title: "Session Complete",
              description: "Congratulations on completing your practice session!",
            });
          }
          
          return 0;
        }
        
        // Update the formatted time display
        const newTime = prev - 1;
        setTimeRemaining(formatTime(newTime));
        return newTime;
      });
    }, 1000);
  }, [blocks, currentBlockIndex, toast]);

  // Handle navigation between blocks
  const handleNext = useCallback(() => {
    // Stop the current timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex(prevIndex => prevIndex + 1);
    } else {
      // Show completion state
      setIsCompleted(true);
      toast({
        title: "Session Complete",
        description: "Congratulations on completing your practice session!",
      });
    }
  }, [currentBlockIndex, blocks.length, toast]);

  const handlePrevious = useCallback(() => {
    // Stop the current timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(prevIndex => prevIndex - 1);
    }
  }, [currentBlockIndex]);

  // Handle timer controls
  const handleReset = useCallback(() => {
    // Stop the current timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const currentBlock = blocks[currentBlockIndex];
    if (currentBlock) {
      const blockDuration = currentBlock.duration * 60; // convert to seconds
      setSecondsLeft(blockDuration);
      setTimeRemaining(formatTime(blockDuration));
      
      // Restart the timer if not paused
      if (!isPaused) {
        startTimer();
      }
    }
  }, [blocks, currentBlockIndex, isPaused, startTimer]);

  const handlePause = useCallback(() => {
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

  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev);
  }, []);

  const handleExit = useCallback(() => {
    // Clean up timer before navigating away
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    navigate("/practice");
  }, [navigate]);

  const handleStartNewSession = useCallback(() => {
    // Reset the session state to start over
    if (blocks.length > 0) {
      setCurrentBlockIndex(0);
      setIsCompleted(false);
      const initialDuration = blocks[0].duration * 60;
      setSecondsLeft(initialDuration);
      setTimeRemaining(formatTime(initialDuration));
      setIsPaused(false);
    }
  }, [blocks]);

  return {
    isLoading,
    routine,
    blocks,
    currentBlockIndex,
    sessionProgress,
    isCompleted,
    setCurrentBlockIndex,
    handleNext,
    handlePrevious,
    handleReset,
    handlePause,
    handleStartNewSession,
    isPaused,
    timeRemaining,
    secondsLeft,
    focusMode,
    toggleFocusMode,
    handleExit
  };
};
