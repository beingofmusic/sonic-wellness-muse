
import React from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import LeaderboardCard from './LeaderboardCard';
import { Award, Clock, Timer } from 'lucide-react';

const PracticeLeaderboard: React.FC = () => {
  const { weeklyTime, allTimeTime, currentStreak, userRank, loading, error } = useLeaderboard();
  
  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col h-48 items-center justify-center text-center text-white/50">
        <p>Unable to load leaderboard data</p>
        <p className="text-sm">Please try again later</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Weekly Practice Time */}
      <LeaderboardCard
        title="Most Practice Time This Week"
        entries={weeklyTime}
        isLoading={loading}
        userRank={userRank.weeklyTimeRank}
        valueLabel="minutes"
        icon={<Clock className="h-4 w-4 text-music-primary" />}
      />
      
      {/* All-Time Practice Time */}
      <LeaderboardCard
        title="All-Time Practice Champion"
        entries={allTimeTime}
        isLoading={loading}
        userRank={userRank.allTimeTimeRank}
        valueLabel="minutes"
        icon={<Timer className="h-4 w-4 text-music-secondary" />}
      />
      
      {/* Current Streak */}
      <LeaderboardCard
        title="Longest Current Streak"
        entries={currentStreak}
        isLoading={loading}
        userRank={userRank.currentStreakRank}
        valueLabel="days"
        icon={<Award className="h-4 w-4 text-music-tertiary" />}
      />
    </div>
  );
};

export default PracticeLeaderboard;
