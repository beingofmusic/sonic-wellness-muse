
import React from "react";
import { Clock, Users, Calendar, Play, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PracticeTemplate } from "@/types/practice";
import { Badge } from "@/components/ui/badge";

interface PracticeTemplateCardProps {
  template: PracticeTemplate;
}

const PracticeTemplateCard: React.FC<PracticeTemplateCardProps> = ({ template }) => {
  // Format duration to readable form
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`;
  };

  // Format date to readable form
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const isUserTemplate = !template.is_template;

  return (
    <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all hover:shadow-md">
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{template.title}</h3>
          {isUserTemplate && (
            <Badge variant={template.visibility === 'public' ? 'default' : 'outline'} className="ml-2">
              {template.visibility === 'public' ? (
                <><Eye className="mr-1 h-3 w-3" /> Public</>
              ) : (
                <><EyeOff className="mr-1 h-3 w-3" /> Private</>
              )}
            </Badge>
          )}
        </div>
        
        <p className="text-white/70 line-clamp-2 text-sm mb-4">
          {template.description || "No description provided"}
        </p>
        
        <div className="flex items-center text-sm text-white/70 space-x-4 mb-3">
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>{formatDuration(template.duration)}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-3.5 h-3.5 mr-1" />
            <span>{template.usageCount || 0} uses</span>
          </div>
        </div>
        
        <div className="flex flex-col space-y-3 mb-4">
          <div className="text-xs text-white/70">
            Includes:
          </div>
          <div className="flex flex-wrap gap-1">
            {template.includes?.map((item, index) => (
              <Badge key={index} variant="outline" className="bg-white/5">
                {item}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-white/10">
          <div className="text-xs text-white/50 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            {formatDate(template.created_at)}
          </div>
          
          <Button 
            variant="default" 
            size="sm" 
            className="bg-music-primary"
            asChild
          >
            <Link to={`/practice/play/${template.id}`}>
              <Play className="mr-2 h-4 w-4" />
              Start
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PracticeTemplateCard;
