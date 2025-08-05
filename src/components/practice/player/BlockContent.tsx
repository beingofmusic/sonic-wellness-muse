
import React from "react";
import DOMPurify from "dompurify";
import { RoutineBlock } from "@/types/practice";
import { Info, MessageCircle, BrainCircuit } from "lucide-react";

interface BlockContentProps {
  block: RoutineBlock;
}

const BlockContent: React.FC<BlockContentProps> = ({ block }) => {
  // Parse content from the block
  const contentLines = block.content?.split('\n') || [];
  const instructions = contentLines.slice(1).join('\n') || 'Follow along with this exercise.';

  const tips = [
    "Notice tone quality, intonation, and how the sound fills the space.",
    "Stay relaxed and maintain good posture throughout the exercise.",
    "Focus on one aspect of technique at a time for best results."
  ];

  // Check if we have formatted instructions
  const hasInstructions = block.instructions && block.instructions.trim() !== "";

  return (
    <div className="space-y-6">
      {/* Instructions section - either from the instructions field or the old way */}
      <div className="p-5 rounded-xl bg-card/60 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-5 w-5 text-music-primary" />
          <h3 className="text-lg font-medium">Instructions</h3>
        </div>
        {hasInstructions ? (
          <div 
            className="prose prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1.5 prose-blockquote:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-hr:my-4"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(block.instructions || '', {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'hr'],
                ALLOWED_ATTR: []
              })
            }}
          />
        ) : (
          <p>{instructions}</p>
        )}
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
