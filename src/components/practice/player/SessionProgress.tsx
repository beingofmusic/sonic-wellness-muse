
import React from "react";
import { Clock } from "lucide-react";
import { RoutineBlock } from "@/types/practice";
import { getCategoryIcon } from "@/components/practice/CategoryConfig";

interface SessionProgressProps {
  blocks: RoutineBlock[];
  currentBlockIndex: number;
  setCurrentBlockIndex: (index: number) => void;
}

const SessionProgress: React.FC<SessionProgressProps> = ({ 
  blocks, 
  currentBlockIndex,
  setCurrentBlockIndex
}) => {
  // Calculate overall progress
  const completedPercentage = Math.round(((currentBlockIndex + 1) / blocks.length) * 100);

  const handleBlockClick = (index: number) => {
    setCurrentBlockIndex(index);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-card/80 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Session Progress</h3>
        <span className="text-sm text-white/70">{completedPercentage}%</span>
      </div>

      <div className="space-y-3">
        {blocks.map((block, index) => {
          const isActive = index === currentBlockIndex;
          const isPast = index < currentBlockIndex;
          const categoryIcon = getCategoryIcon(block.type);
          const blockTitle = block.content?.split('\n')[0] || 'Practice Block';
          
          return (
            <div 
              key={block.id}
              className={`p-3 rounded-lg border ${isActive ? 'border-music-primary bg-music-primary/10' : 'border-white/10'} 
                        ${isPast ? 'opacity-50' : ''} cursor-pointer transition-all duration-200 hover:bg-card`}
              onClick={() => handleBlockClick(index)}
            >
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-card flex items-center justify-center">
                  <span className="text-sm">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{blockTitle}</h4>
                  <div className="flex items-center text-xs text-white/60 mt-1">
                    <span className="mr-1">{categoryIcon}</span>
                    <span>{block.type}</span>
                    <span className="mx-1">•</span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{block.duration} min</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-center text-sm text-white/50 italic">
        Let's begin your musical journey...
      </div>
    </div>
  );
};

export default SessionProgress;
