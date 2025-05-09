
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, BookOpen } from "lucide-react";
import { JournalPrompt } from '@/types/wellness';
import { useNavigate } from 'react-router-dom';

interface JournalPromptCardProps {
  prompt: JournalPrompt;
}

const JournalPromptCard: React.FC<JournalPromptCardProps> = ({ prompt }) => {
  const navigate = useNavigate();
  
  const getTypeIcon = () => {
    switch (prompt.type) {
      case 'self_composition':
        return '✍️';
      case 'values':
        return '🌟';
      case 'resistance':
        return '🧗‍♀️';
      case 'learning':
        return '📝';
      default:
        return '📓';
    }
  };
  
  const getTypeLabel = () => {
    switch (prompt.type) {
      case 'self_composition':
        return 'Self Composition';
      case 'values':
        return 'Values';
      case 'resistance':
        return 'Resistance';
      case 'learning':
        return 'Learning';
      default:
        return 'Journal';
    }
  };
  
  const handleOpenJournal = () => {
    navigate(`/wellness/journal/${prompt.id}`);
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all h-full flex flex-col">
      <CardContent className="p-4 flex-grow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getTypeIcon()}</span>
            <span className="text-xs text-white/70 bg-white/5 px-2 py-1 rounded-full">
              {getTypeLabel()}
            </span>
          </div>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 truncate">
          {prompt.title}
        </h3>
        
        <div className="flex items-center text-xs text-white/70 mb-2">
          <Clock className="h-3 w-3 mr-1" /> 
          {prompt.duration_minutes} minutes
        </div>
        
        <p className="text-sm text-white/70 line-clamp-3">
          {prompt.description}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleOpenJournal}
          variant="outline"
          className="w-full border-music-primary/40 hover:border-music-primary/60 hover:bg-music-primary/10"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Open Journal
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JournalPromptCard;
