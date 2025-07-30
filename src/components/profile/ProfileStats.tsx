
import React from "react";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import { UserPracticeStats } from "@/hooks/usePracticeStatsById";
import { Clock, Calendar, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMinutes } from "@/lib/formatters";

interface ProfileStatsProps {
  isLoading?: boolean;
  stats?: UserPracticeStats;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ isLoading = false, stats: providedStats }) => {
  const { stats: ownStats, formattedTotalTime } = usePracticeStats();
  
  // Use provided stats if available (for viewing other users), otherwise use own stats
  const stats = providedStats || ownStats;
  const totalTimeFormatted = providedStats ? formatMinutes(providedStats.totalMinutes) : formattedTotalTime;

  const statItems = [
    {
      icon: <Clock className="h-5 w-5 text-music-primary" />,
      label: "Total Practice",
      value: totalTimeFormatted,
    },
    {
      icon: <Calendar className="h-5 w-5 text-music-secondary" />,
      label: "Current Streak",
      value: `${stats.currentStreak} days`,
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-music-tertiary" />,
      label: "Sessions Completed",
      value: ('totalSessions' in stats ? stats.totalSessions : stats.sessionCount || 0).toString(),
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
