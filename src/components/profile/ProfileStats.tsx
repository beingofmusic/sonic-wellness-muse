
import React from "react";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import { UserPracticeStats } from "@/hooks/usePracticeStatsById";
import { Clock, Calendar, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMinutes } from "@/lib/formatters";

interface ProfileStatsProps {
  isLoading: boolean;
  customStats?: UserPracticeStats;
  isOwnProfile?: boolean;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ isLoading, customStats, isOwnProfile = true }) => {
  const { stats: ownStats, formattedTotalTime } = usePracticeStats();
  
  // Use custom stats if provided (for other users), otherwise use own stats
  const stats = customStats || {
    totalPracticeTime: ownStats.totalPracticeMinutes,
    currentStreak: ownStats.currentStreak,
    totalSessions: ownStats.sessionCount,
    longestStreak: 0, // Not available in current PracticeStats
    averageSessionLength: 0, // Not available in current PracticeStats
    thisWeekMinutes: 0, // Not available in current PracticeStats
    thisMonthMinutes: 0 // Not available in current PracticeStats
  };

  const statItems = [
    {
      icon: <Clock className="h-5 w-5 text-music-primary" />,
      label: "Total Practice",
      value: customStats ? formatMinutes(stats.totalPracticeTime) : formattedTotalTime,
    },
    {
      icon: <Calendar className="h-5 w-5 text-music-secondary" />,
      label: "Current Streak",
      value: `${stats.currentStreak} days`,
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-music-tertiary" />,
      label: "Sessions Completed",
      value: stats.totalSessions.toString(),
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
