
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { WellnessPractice } from '@/types/wellness';
import { useNavigate } from 'react-router-dom';

interface WellnessPracticeCardProps {
  practice: WellnessPractice;
}

const WellnessPracticeCard: React.FC<WellnessPracticeCardProps> = ({ practice }) => {
  const navigate = useNavigate();
  
  const getTypeIcon = () => {
    switch (practice.type) {
      case 'meditation':
        return '🧘‍♀️';
      case 'breathwork':
        return '🫁';
      case 'yoga_fitness':
        return '🧠';
      default:
        return '🌿';
    }
  };
  
  const getTypeLabel = () => {
    switch (practice.type) {
      case 'meditation':
        return 'Meditation';
      case 'breathwork':
        return 'Breathwork';
      case 'yoga_fitness':
        return 'Yoga & Fitness';
      default:
        return 'Practice';
    }
  };
  
  const handleStartPractice = () => {
    navigate(`/wellness/practice/${practice.id}`);
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all overflow-hidden h-full flex flex-col">
      {practice.image_url && (
        <div className="relative h-36 overflow-hidden">
          <img 
            src={practice.image_url} 
            alt={practice.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <span className="absolute bottom-2 left-3 text-xl">{getTypeIcon()}</span>
          <span className="absolute bottom-3 right-3 text-xs text-white/70 bg-black/50 px-2 py-1 rounded-full">
            {getTypeLabel()}
          </span>
        </div>
      )}
      
      <CardContent className={`p-4 flex-grow ${!practice.image_url ? 'pt-4' : 'pt-4'}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg truncate">
            {!practice.image_url && <span className="mr-2">{getTypeIcon()}</span>}
            {practice.title}
          </h3>
        </div>
        <div className="flex items-center text-sm text-white/70 mb-2">
          <Clock className="h-3 w-3 mr-1" /> 
          {practice.duration_minutes} minutes
        </div>
        <p className="text-sm text-white/70 line-clamp-3">
          {practice.description}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleStartPractice}
          className="w-full bg-music-primary/80 hover:bg-music-primary"
        >
          Start Practice
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WellnessPracticeCard;
