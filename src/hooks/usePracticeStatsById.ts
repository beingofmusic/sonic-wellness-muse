import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PracticeStats {
  totalMinutes: number;
  sessionCount: number;
  currentStreak: number;
}

export const usePracticeStatsById = (userId?: string) => {
  const [stats, setStats] = useState<PracticeStats>({
    totalMinutes: 0,
    sessionCount: 0,
    currentStreak: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async (targetUserId: string) => {
    try {
      setIsLoading(true);

      // Get total practice minutes and session count
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('practice_sessions')
        .select('total_duration')
        .eq('user_id', targetUserId);

      if (sessionsError) throw sessionsError;

      const totalMinutes = sessionsData?.reduce((sum, session) => sum + (session.total_duration || 0), 0) || 0;
      const sessionCount = sessionsData?.length || 0;

      // Get current streak using the streak leaderboard function
      const { data: streakData, error: streakError } = await supabase
        .rpc('get_streak_leaderboard');

      if (streakError) throw streakError;

      const userStreak = streakData?.find((entry: any) => entry.user_id === targetUserId)?.current_streak || 0;

      setStats({
        totalMinutes,
        sessionCount,
        currentStreak: userStreak
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStats({
        totalMinutes: 0,
        sessionCount: 0,
        currentStreak: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchStats(userId);
    }
  }, [userId]);

  // Format total time
  const formattedTotalTime = (() => {
    if (stats.totalMinutes < 60) {
      return `${stats.totalMinutes}m`;
    }
    const hours = Math.floor(stats.totalMinutes / 60);
    const minutes = stats.totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  })();

  return {
    stats,
    isLoading,
    formattedTotalTime,
    refetch: userId ? () => fetchStats(userId) : () => {}
  };
};