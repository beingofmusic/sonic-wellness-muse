
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Circle, Edit3, Type } from "lucide-react";
import { JournalPrompt } from "@/types/journal";
import { useNavigate } from "react-router-dom";

interface JournalPromptCardProps {
  prompt: JournalPrompt;
  isCompleted?: boolean;
  hasStarted?: boolean;
  order: number;
}

const JournalPromptCard: React.FC<JournalPromptCardProps> = ({
  prompt,
  isCompleted = false,
  hasStarted = false,
  order
}) => {
  const navigate = useNavigate();
  
  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }
    
    if (hasStarted) {
      return (
        <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">
          <Edit3 className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-white/5">
        <Circle className="h-3 w-3 mr-1" />
        Not Started
      </Badge>
    );
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            <span className="bg-music-primary/20 text-music-primary h-6 w-6 flex items-center justify-center rounded-full text-xs font-bold mr-2">
              {order}
            </span>
            {prompt.title}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-white/80 mb-2">
          {prompt.description}
        </CardDescription>
        <div className="text-sm text-white/70 line-clamp-3 flex items-start gap-1">
          <Type className="h-3 w-3 mt-1 shrink-0" />
          <span>{prompt.prompt_text.split('\n')[0]}...</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => navigate(`/journal/prompt/${prompt.id}`)} 
          className="w-full bg-music-primary/20 hover:bg-music-primary/30"
        >
          {isCompleted ? "Review Entry" : hasStarted ? "Continue Writing" : "Start Writing"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JournalPromptCard;
