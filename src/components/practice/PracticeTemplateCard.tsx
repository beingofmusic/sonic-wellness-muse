
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { PracticeTemplate } from "@/types/practice";
import { Link } from "react-router-dom";

interface PracticeTemplateCardProps {
  template: PracticeTemplate;
}

const PracticeTemplateCard: React.FC<PracticeTemplateCardProps> = ({ template }) => {
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
      
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-1 text-xs text-white/50">
          <span>{template.usageCount} uses</span>
          <span>•</span>
          <span>Created by {template.creator}</span>
        </div>
        
        <Link to={`/practice/template/${template.id}`}>
          <Button className="bg-music-primary hover:bg-music-secondary text-white">
            Start Practice
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PracticeTemplateCard;
