
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, BookMarked, BookOpenCheck } from "lucide-react";
import { JournalSectionType } from "@/types/journal";
import { useNavigate } from "react-router-dom";

interface JournalSectionCardProps {
  title: string;
  description: string;
  section: JournalSectionType;
  totalPrompts: number;
  completedPrompts: number;
  completionPercentage: number;
}

const JournalSectionCard: React.FC<JournalSectionCardProps> = ({
  title,
  description,
  section,
  totalPrompts,
  completedPrompts,
  completionPercentage
}) => {
  const navigate = useNavigate();
  
  const getIcon = () => {
    switch (section) {
      case "past":
        return <BookMarked className="h-5 w-5 text-yellow-500" />;
      case "present":
        return <BookOpenCheck className="h-5 w-5 text-blue-500" />;
      case "future":
        return <BookOpenCheck className="h-5 w-5 text-emerald-500" />;
      default:
        return <BookMarked className="h-5 w-5 text-music-primary" />;
    }
  };
  
  const getStatusText = () => {
    if (completedPrompts === 0) return "Not Started";
    if (completedPrompts === totalPrompts) return "Completed";
    return "In Progress";
  };
  
  const getStatusColor = () => {
    if (completedPrompts === 0) return "bg-gray-500";
    if (completedPrompts === totalPrompts) return "bg-green-500";
    return "bg-blue-500";
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
          <Badge variant="outline" className={`${getStatusColor()} bg-opacity-20`}>
            {getStatusText()}
          </Badge>
        </div>
        <CardDescription className="text-white/70">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress 
            value={completionPercentage} 
            className="h-2" 
          />
          <p className="text-sm text-white/70">
            {completedPrompts} of {totalPrompts} prompts completed ({completionPercentage}%)
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => navigate(`/journal/${section}`)} 
          className="w-full bg-music-primary/20 hover:bg-music-primary/30"
        >
          {completedPrompts === 0 ? "Start" : "Continue"} 
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JournalSectionCard;
