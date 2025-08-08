import React, { useState } from "react";
import { Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  className?: string;
}

const tooltips = [
  "Needs work",
  "Could be clearer",
  "Good session",
  "Really helpful",
  "Loved it!",
];

export const StarRating: React.FC<StarRatingProps> = ({ value, onChange, size = 22, className }) => {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        {Array.from({ length: 5 }).map((_, i) => {
          const ratingValue = i + 1;
          const active = (hover ?? value) >= ratingValue;
          return (
            <Tooltip key={ratingValue}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`${ratingValue} star${ratingValue > 1 ? 's' : ''}`}
                  className="p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onChange(ratingValue)}
                >
                  <Star
                    size={size}
                    className={cn(
                      "transition-colors",
                      active ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltips[i]}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default StarRating;
