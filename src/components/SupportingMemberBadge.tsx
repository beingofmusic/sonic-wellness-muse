import React from "react";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SupportingMemberBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SupportingMemberBadge: React.FC<SupportingMemberBadgeProps> = ({ 
  size = "md", 
  className = "" 
}) => {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  return (
    <Badge 
      variant="outline" 
      className={`
        bg-gradient-to-r from-music-primary/20 to-pink-500/20 
        border-music-primary/50 text-music-primary 
        hover:bg-gradient-to-r hover:from-music-primary/30 hover:to-pink-500/30
        flex items-center gap-1 font-medium
        ${sizeClasses[size]} ${className}
      `}
    >
      <Heart className={`${iconSizes[size]} fill-current`} />
      Supporting Member
    </Badge>
  );
};

export default SupportingMemberBadge;