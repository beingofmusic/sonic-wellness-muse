
import React from "react";
import { RoutineBlock } from "@/types/practice";
import { Info, MessageCircle, BrainCircuit } from "lucide-react";

interface BlockContentProps {
  block: RoutineBlock;
}

const BlockContent: React.FC<BlockContentProps> = ({ block }) => {
  // Parse content from the block
  // The first line is treated as the title, remaining as instructions
  const contentLines = block.content?.split('\n') || [];
  
  // Use custom instructions if available, otherwise use the default fallback
  const instructions = block.instructions || (contentLines.slice(1).join('\n') || 'Follow along with this exercise.');

  const tips = [
    "Notice tone quality, intonation, and how the sound fills the space.",
    "Stay relaxed and maintain good posture throughout the exercise.",
    "Focus on one aspect of technique at a time for best results."
  ];

  return (
    <div className="space-y-6">
      {/* Instructions section */}
      <div className="p-5 rounded-xl bg-card/60 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-5 w-5 text-music-primary" />
          <h3 className="text-lg font-medium">Instructions</h3>
        </div>
        <p>{instructions}</p>
      </div>
      
      {/* Tips section */}
      <div className="p-5 rounded-xl bg-card/60 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-medium">Tips</h3>
        </div>
        <p>{tips[0]}</p>
      </div>
      
      {/* Mindfulness prompt based on block type */}
      {block.type === 'mindfulness' && (
        <div className="p-5 rounded-xl bg-blue-900/20 border border-blue-800/30">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium">Mindfulness Prompt</h3>
          </div>
          <p className="italic">
            "Focus on your breath. Allow it to flow naturally, noticing its rhythm and depth."
          </p>
        </div>
      )}
      
      {/* AI Coach tips */}
      <div className="p-5 rounded-xl bg-purple-900/20 border border-purple-800/30">
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-medium">AI Coach Tips</h3>
        </div>
        <p>
          Remember to stay present and focused on each note. Listen carefully to your sound quality
          and intonation.
        </p>
      </div>
    </div>
  );
};

export default BlockContent;
