
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PracticeRoutine, RoutineBlock } from "@/types/practice";
import { checkRoutineAccess, fetchRoutineBlocks, createPracticeSession } from "@/services/practiceService";
import { useToast } from "@/hooks/use-toast";
import { formatTime } from "@/lib/formatters";
import { useAuth } from "@/context/AuthContext";
import { AudioRecorderRef } from "@/components/practice/recording/AudioRecorder";

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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showRecordingChoice, setShowRecordingChoice] = useState(false);
  const [shouldRecord, setShouldRecord] = useState(false);
  const [hasChosenRecording, setHasChosenRecording] = useState(false);
  const [awaitingRecordingSave, setAwaitingRecordingSave] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRecorderRef = useRef<AudioRecorderRef>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

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
        
        // Handle special case for open practice
        if (routineId === 'open-practice') {
          const openPracticeRoutine: PracticeRoutine = {
            id: 'open-practice',
            title: 'Open Practice',
            description: 'Unstructured practice session',
            duration: 0, // Will be set by user
            created_by: user?.id || '',
            is_template: false,
            tags: ['freestyle', 'creative'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const openPracticeBlocks: RoutineBlock[] = [{
            id: 'open-practice-block',
            routine_id: 'open-practice',
            order_index: 0,
            type: 'Open Practice',
            content: 'Practice freely without structure',
            instructions: 'Use this time for creative exploration, warming up, or working on whatever feels right.',
            duration: 30, // Default 30 minutes, user can adjust
            created_at: new Date().toISOString()
          }];
          
          setRoutine(openPracticeRoutine);
          setBlocks(openPracticeBlocks);
          
          // Set initial timer to 30 minutes (1800 seconds)
          const initialDuration = 30 * 60;
          setSecondsLeft(initialDuration);
          setTimeRemaining(formatTime(initialDuration));
          
          // Create practice session for open practice (with NULL routine_id)
          if (user?.id) {
            try {
              const newSessionId = await createPracticeSession(user.id, null, 30);
              setSessionId(newSessionId);
            } catch (error) {
              console.error("Error creating open practice session:", error);
            }
          }
          
          // Show recording choice dialog
          setShowRecordingChoice(true);
          setIsLoading(false);
          return;
        }
        
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

        // Create practice session
        if (user?.id && routineData.id) {
          try {
            const totalDuration = blocksData.reduce((sum, block) => sum + block.duration, 0);
            const newSessionId = await createPracticeSession(user.id, routineData.id, totalDuration);
            setSessionId(newSessionId);
          } catch (error) {
            console.error("Error creating practice session:", error);
            // Continue without session ID - recordings will still work but won't be linked
          }
        }

        // Show recording choice dialog after loading data
        setShowRecordingChoice(true);
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

  // Start countdown timer when blocks load and not paused - but only after recording choice is made
  useEffect(() => {
    if (blocks.length === 0 || isLoading || isPaused || !hasChosenRecording) return;
    
    // Start the timer
    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [blocks, isLoading, isPaused, hasChosenRecording]);

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
          
          // Auto advance to next block or complete session
          if (currentBlockIndex < blocks.length - 1) {
            setCurrentBlockIndex(prevIndex => prevIndex + 1);
          } else {
            // Session completed naturally - handle recording
            handleSessionCompletion();
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

  // Handle session completion (both natural and manual)
  const handleSessionCompletion = useCallback(async () => {
    console.log('Session completing, checking for active recording...');
    
    // Check if there's an active recording to save
    if (shouldRecord && audioRecorderRef.current?.isCurrentlyRecording()) {
      // Stop the recording and trigger save dialog (same as manual stop)
      setAwaitingRecordingSave(true);
      audioRecorderRef.current.stopAndShowSaveDialog();
      // Don't complete session yet - wait for recording to be handled
      return;
    }
    
    // Show completion state
    setIsCompleted(true);
    toast({
      title: "Session Complete",
      description: "Congratulations on completing your practice session!",
    });
  }, [shouldRecord, routine, toast]);

  // Handle navigation between blocks
  const handleNext = useCallback(() => {
    // Stop the current timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex(prevIndex => prevIndex + 1);
    } else {
      // Handle manual completion
      handleSessionCompletion();
    }
  }, [currentBlockIndex, blocks.length, handleSessionCompletion]);

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
      setShowRecordingChoice(true);
      setHasChosenRecording(false);
    }
  }, [blocks]);

  const handleRecordingChoice = useCallback((shouldRecord: boolean) => {
    setShouldRecord(shouldRecord);
    setShowRecordingChoice(false);
    setHasChosenRecording(true);
  }, []);

  const handleRecordingSaveComplete = useCallback(() => {
    console.log('Recording save completed, finishing session...');
    setAwaitingRecordingSave(false);
    setIsCompleted(true);
    toast({
      title: "Session Complete",
      description: "Congratulations on completing your practice session!",
    });
  }, [toast]);

  return {
    isLoading,
    routine,
    blocks,
    currentBlockIndex,
    sessionProgress,
    isCompleted,
    sessionId,
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
    handleExit,
    showRecordingChoice,
    shouldRecord,
    handleRecordingChoice,
    audioRecorderRef,
    awaitingRecordingSave,
    handleRecordingSaveComplete
  };
};
