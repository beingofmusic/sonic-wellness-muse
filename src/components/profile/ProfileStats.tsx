
import React from "react";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import { Clock, Calendar, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileStatsProps {
  isLoading: boolean;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ isLoading }) => {
  const { stats, formattedTotalTime } = usePracticeStats();

  const statItems = [
    {
      icon: <Clock className="h-5 w-5 text-music-primary" />,
      label: "Total Practice",
      value: formattedTotalTime,
    },
    {
      icon: <Calendar className="h-5 w-5 text-music-secondary" />,
      label: "Current Streak",
      value: `${stats.currentStreak} days`,
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-music-tertiary" />,
      label: "Sessions Completed",
      value: stats.sessionCount.toString(),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/5"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statItems.map((item, index) => (
        <div 
          key={index}
          className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/5"
        >
          <div className="p-2 bg-white/5 rounded-full">
            {item.icon}
          </div>
          <div>
            <p className="text-sm text-white/70">{item.label}</p>
            <p className="text-xl font-semibold">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;
