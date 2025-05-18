
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useRoutinePlayer } from "@/hooks/useRoutinePlayer";
import PracticeSession from "@/components/practice/player/PracticeSession";
import LoadingState from "@/components/practice/player/LoadingState";
import PracticeCompletionScreen from "@/components/practice/player/PracticeCompletionScreen";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const RoutinePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { 
    isLoading, 
    routine, 
    blocks,
    currentBlockIndex,
    sessionProgress,
    isCompleted,
    accessError,
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
  } = useRoutinePlayer(id);

  // Display loading state while fetching routine data
  if (isLoading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  // If access error, display appropriate message
  if (accessError) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <h1 className="text-2xl font-semibold mb-4">Access Restricted</h1>
          <p className="text-white/70 mb-6">{accessError}</p>
          
          {!user && (
            <div className="space-y-4">
              <p className="text-white/70">Sign in to access private routines</p>
              <Button asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
            </div>
          )}
          
          <Link to="/practice" className="text-music-primary hover:underline mt-6">
            Return to Practice Studio
          </Link>
        </div>
      </Layout>
    );
  }

  // If no routine found, display an error
  if (!routine || !blocks || blocks.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-6">
          <h1 className="text-2xl font-semibold mb-4">Routine not found</h1>
          <Link to="/practice" className="text-music-primary hover:underline">
            Return to Practice Studio
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {isCompleted ? (
        <PracticeCompletionScreen 
          routine={routine} 
          blocks={blocks}
          onStartNewSession={handleStartNewSession}
        />
      ) : (
        <PracticeSession 
          routine={routine}
          blocks={blocks}
          currentBlockIndex={currentBlockIndex}
          sessionProgress={sessionProgress}
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
        />
      )}
    </Layout>
  );
};

export default RoutinePlayer;
