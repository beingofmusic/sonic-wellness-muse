
import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useRoutinePlayer } from "@/hooks/useRoutinePlayer";
import PracticeSession from "@/components/practice/player/PracticeSession";
import LoadingState from "@/components/practice/player/LoadingState";
import PracticeCompletionScreen from "@/components/practice/player/PracticeCompletionScreen";
import RecordingChoiceDialog from "@/components/practice/player/RecordingChoiceDialog";
import { logContentIssue } from "@/services/loggingService";

const RoutinePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
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
    handleRecordingSaveComplete,
    elapsedTimeSeconds
  } = useRoutinePlayer(id);

  // Log content issues if routine or blocks are missing
  useEffect(() => {
    if (!isLoading && id) {
      const hasRoutine = !!routine;
      const blocksCount = Array.isArray(blocks) ? blocks.length : null;

      if (!hasRoutine) {
        logContentIssue({
          routine_id: id,
          page: "RoutinePlayer",
          issue_type: "ROUTINE_NOT_FOUND",
          details: { reason: "Routine not found or inaccessible", hasRoutine, blocksCount },
        });
      } else if (blocksCount === 0) {
        logContentIssue({
          routine_id: id,
          page: "RoutinePlayer",
          issue_type: "NO_BLOCKS",
          details: { reason: "Routine has zero blocks", hasRoutine, blocksCount },
        });
      }
    }
  }, [isLoading, id, routine, blocks]);

  // Display loading state while fetching routine data
  if (isLoading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  // If no routine found, display an error
  if (!routine || !blocks || blocks.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-6">
          <h1 className="text-2xl font-semibold mb-2">Routine not found</h1>
          <p className="text-muted-foreground mb-4 text-center">
            This routine is unavailable right now. Our team has been notified.
          </p>
          <Link to="/practice" className="text-music-primary hover:underline">
            Return to Practice Studio
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <RecordingChoiceDialog
        isOpen={showRecordingChoice}
        onChoice={handleRecordingChoice}
      />
      
      {isCompleted ? (
        <PracticeCompletionScreen 
          routine={routine} 
          blocks={blocks}
          sessionId={sessionId}
          elapsedTimeSeconds={elapsedTimeSeconds}
        />
      ) : (
        <PracticeSession 
          routine={routine}
          blocks={blocks}
          currentBlockIndex={currentBlockIndex}
          sessionProgress={sessionProgress}
          sessionId={sessionId}
          setCurrentBlockIndex={setCurrentBlockIndex}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onReset={handleReset}
          onPause={handlePause}
          isPaused={isPaused}
          timeRemaining={timeRemaining}
          secondsLeft={secondsLeft}
          focusMode={focusMode}
          toggleFocusMode={toggleFocusMode}
          onExit={handleExit}
          shouldRecord={shouldRecord}
          audioRecorderRef={audioRecorderRef}
          awaitingRecordingSave={awaitingRecordingSave}
          onRecordingSaveComplete={handleRecordingSaveComplete}
        />
      )}
    </Layout>
  );
};

export default RoutinePlayer;
