
import React from "react";
import { Badge as BadgeType } from "@/hooks/useUserProfile";
import { formatDistanceToNow } from "date-fns";
import { Award, Calendar, Book, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgeCollectionProps {
  badges: BadgeType[];
  isLoading: boolean;
}

const BadgeCollection: React.FC<BadgeCollectionProps> = ({ badges, isLoading }) => {
  // Function to get the appropriate icon for a badge
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'award':
        return <Award className="h-6 w-6" />;
      case 'calendar':
        return <Calendar className="h-6 w-6" />;
      case 'book':
        return <Book className="h-6 w-6" />;
      case 'clock':
        return <Clock className="h-6 w-6" />;
      default:
        return <Award className="h-6 w-6" />;
    }
  };

  // Function to get background color based on condition type
  const getBadgeColor = (conditionType: string) => {
    switch (conditionType) {
      case 'practice_streak':
        return 'bg-blue-500/20 text-blue-400';
      case 'practice_minutes':
        return 'bg-purple-500/20 text-purple-400';
      case 'sessions_completed':
        return 'bg-green-500/20 text-green-400';
      case 'courses_completed':
        return 'bg-amber-500/20 text-amber-400';
      case 'first_practice':
        return 'bg-pink-500/20 text-pink-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center p-8">
        <Award className="h-12 w-12 text-white/20 mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-2">No badges yet</h3>
        <p className="text-white/60">
          Complete practice sessions, maintain streaks, and finish courses to earn achievements!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <TooltipProvider key={badge.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex flex-col items-center justify-center p-4 rounded-lg border border-white/10 ${getBadgeColor(badge.condition_type)} transition-all hover:scale-105 cursor-help`}>
                  <div className="mb-3">
                    {getBadgeIcon(badge.icon)}
                  </div>
                  <h4 className="font-medium text-center mb-1">{badge.title}</h4>
                  <Badge variant="outline" className="bg-white/10 text-xs">
                    {formatDistanceToNow(new Date(badge.earned_at), { addSuffix: true })}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="text-sm">
                  <p className="font-medium mb-1">{badge.title}</p>
                  <p>{badge.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};

export default BadgeCollection;
