
import React, { useMemo, useRef } from "react";
import { ArrowLeft, X, Maximize, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PracticeRoutine, RoutineBlock } from "@/types/practice";
import SessionHeader from "./SessionHeader";
import SessionProgress from "./SessionProgress";
import BlockContent from "./BlockContent";
import PracticeTools from "./PracticeTools";
import AudioRecorder, { AudioRecorderRef } from "../recording/AudioRecorder";
import { getCategoryColorClass, getCategoryIcon } from "@/components/practice/CategoryConfig";

interface PracticeSessionProps {
  routine: PracticeRoutine;
  blocks: RoutineBlock[];
  currentBlockIndex: number;
  sessionProgress: number;
  sessionId: string | null;
  setCurrentBlockIndex: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
  onPause: () => void;
  isPaused: boolean;
  timeRemaining: string;
  secondsLeft: number;
  focusMode: boolean;
  toggleFocusMode: () => void;
  onExit: () => void;
  shouldRecord: boolean;
  audioRecorderRef?: React.RefObject<AudioRecorderRef>;
}

const PracticeSession: React.FC<PracticeSessionProps> = ({
  routine,
  blocks,
  currentBlockIndex,
  sessionProgress,
  sessionId,
  setCurrentBlockIndex,
  onNext,
  onPrevious,
  onReset,
  onPause,
  isPaused,
  timeRemaining,
  secondsLeft,
  focusMode,
  toggleFocusMode,
  onExit,
  shouldRecord,
  audioRecorderRef
}) => {
  const currentBlock = blocks[currentBlockIndex];
  const colorClass = currentBlock ? getCategoryColorClass(currentBlock.type) : '';
  const categoryIcon = currentBlock ? getCategoryIcon(currentBlock.type) : null;
  const blockNum = currentBlockIndex + 1;
  const totalBlocks = blocks.length;
  
  // Calculate timer progress percentage
  const timerProgress = useMemo(() => {
    if (!currentBlock) return 0;
    
    const totalDuration = currentBlock.duration * 60; // total seconds
    if (totalDuration === 0) return 0;
    
    const elapsed = totalDuration - secondsLeft;
    return (elapsed / totalDuration) * 100;
  }, [currentBlock, secondsLeft]);

  return (
    <div className="h-full max-w-full">
      {/* Top navigation */}
      <div className="flex justify-between items-center mb-6">
        <Link to="/practice" className="text-white/70 hover:text-white flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>
        
        <div className="text-center">
          <h1 className="text-xl font-semibold">{routine.title}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleFocusMode}
            className="text-white/70 hover:text-white"
          >
            <Maximize className="h-4 w-4" />
            <span className="ml-1">Focus Mode</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onExit}
            className="text-white/70 hover:text-white"
          >
            <X className="h-4 w-4" />
            <span className="ml-1">Exit</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content area */}
        <div className="flex-1">
          {/* Session header showing block number */}
          <SessionHeader 
            blockNum={blockNum} 
            totalBlocks={totalBlocks}
            onPause={onPause}
            isPaused={isPaused}
          />
          
          {/* Current block content */}
          <div className={`rounded-lg border-l-4 ${colorClass} bg-gradient-to-r ${colorClass} p-6 mb-6`}>
            <div className="flex items-center gap-2 mb-1">
              {categoryIcon && <span>{categoryIcon}</span>}
              <span className="text-sm text-white/70">
                {currentBlock.type} · {currentBlock.duration} minutes
              </span>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">{currentBlock.content?.split('\n')[0] || 'Practice Block'}</h2>
            
            {/* Timer */}
            <div className="text-center py-8">
              <div className="text-5xl font-mono mb-4">{timeRemaining}</div>
              <div className="w-full h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
                <div 
                  className="h-full bg-music-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${timerProgress}%` }} 
                />
              </div>
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm" onClick={onPause}>
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  <span className="ml-1">{isPaused ? 'Resume' : 'Pause'}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={onReset}>
                  <RotateCcw className="h-4 w-4" />
                  <span className="ml-1">Reset</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Block details and instructions */}
          <BlockContent block={currentBlock} />
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={onPrevious}
              disabled={currentBlockIndex === 0}
            >
              ← Previous
            </Button>
            
            <Button 
              onClick={onNext}
              className="bg-music-primary hover:bg-music-secondary"
            >
              Next →
            </Button>
          </div>
        </div>
        
        {/* Right sidebar - only visible if not in focus mode */}
        {!focusMode && (
          <div className="md:w-96 space-y-6">
            <SessionProgress 
              blocks={blocks}
              currentBlockIndex={currentBlockIndex}
              setCurrentBlockIndex={setCurrentBlockIndex}
            />
            
            <PracticeTools />
            
            {shouldRecord && (
              <>
                {console.log('Rendering AudioRecorder with:', { sessionId, shouldRecord })}
                <AudioRecorder 
                  ref={audioRecorderRef} 
                  sessionId={sessionId} 
                  autoStart={true} 
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeSession;
