
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, Star, Heart } from "lucide-react";
import { PracticeTemplate } from "@/types/practice";
import { Link } from "react-router-dom";
import ClickableUserProfile from "@/components/ClickableUserProfile";
import { useRatingSummary, useComments } from "@/hooks/useRoutineFeedback";

interface PracticeTemplateCardProps {
  template: PracticeTemplate;
}

const PracticeTemplateCard: React.FC<PracticeTemplateCardProps> = ({ template }) => {
  const { data: ratingSummary } = useRatingSummary(template.id);
  const { data: comments } = useComments(template.id, 1);
  const avg = ratingSummary ? Math.round(ratingSummary.average * 10) / 10 : null;
  const topComment = comments && comments.length > 0 ? comments[0] : null;
  return (
    <div className="p-5 rounded-xl border border-white/10 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-200">
      <div className="flex items-center mb-2">
        <Clock className="h-4 w-4 text-white/60 mr-2" />
        <span className="text-sm text-white/60">{template.duration} min</span>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{template.title}</h3>
      <p className="text-white/70 text-sm mb-3">{template.description}</p>
      
      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {template.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded-md bg-white/10 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {template.includes && template.includes.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm text-white/60 mb-1">Includes:</h4>
          <ul className="space-y-1">
            {template.includes.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-music-primary"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {avg !== null && ratingSummary && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <span>{avg.toFixed(1)} ({ratingSummary.count} ratings)</span>
        </div>
      )}

      {topComment && (
        <div className="text-xs text-white/70 mb-3 italic line-clamp-2">
          “{topComment.comment}”
          {typeof topComment.likes === 'number' && topComment.likes > 0 && (
            <span className="ml-2 not-italic inline-flex items-center gap-1 text-white/60">
              <Heart className="h-3 w-3" /> {topComment.likes}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-1 text-xs text-white/50">
          <span>{template.usageCount} uses</span>
          <span>•</span>
          <span>Created by </span>
          {template.created_by ? (
            <ClickableUserProfile
              userId={template.created_by}
              username={template.creator}
              className="text-xs"
            />
          ) : (
            <span>{template.creator}</span>
          )}
        </div>
        
        <Link to={`/practice/routine/${template.id}`}>
          <Button className="bg-music-primary hover:bg-music-secondary text-white">
            Start Practice
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PracticeTemplateCard;
