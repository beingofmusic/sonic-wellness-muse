
import React from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface SessionHeaderProps {
  blockNum: number;
  totalBlocks: number;
  isPaused: boolean;
  onPause: () => void;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({ 
  blockNum, 
  totalBlocks,
  isPaused,
  onPause
}) => {
  return (
    <div className="flex items-center justify-between mb-4 p-2 rounded-lg bg-card/50">
      <div>
        <span className="text-sm font-medium text-white/70">
          Exercise {blockNum} of {totalBlocks}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onPause}
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </Button>
      </div>
    </div>
  );
};

export default SessionHeader;
