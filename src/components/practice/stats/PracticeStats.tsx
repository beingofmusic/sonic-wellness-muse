
import React from "react";
import { Clock, Calendar, CheckCircle } from "lucide-react";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import StatsCard from "./StatsCard";

const PracticeStats: React.FC = () => {
  const { stats, isLoading, formattedTotalTime } = usePracticeStats();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      <StatsCard
        title="Total Practice Time"
        value={formattedTotalTime}
        icon={<Clock className="h-5 w-5 text-music-primary" />}
        color="bg-music-primary"
        isLoading={isLoading}
      />
      <StatsCard
        title="Current Streak"
        value={isLoading ? "..." : `${stats.currentStreak} days`}
        icon={<Calendar className="h-5 w-5 text-music-secondary" />}
        color="bg-music-secondary"
        isLoading={isLoading}
      />
      <StatsCard
        title="Completed Routines"
        value={stats.sessionCount}
        icon={<CheckCircle className="h-5 w-5 text-music-tertiary" />}
        color="bg-music-tertiary"
        isLoading={isLoading}
      />
    </div>
  );
};

export default PracticeStats;
