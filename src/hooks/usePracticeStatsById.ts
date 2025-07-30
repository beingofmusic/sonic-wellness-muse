import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserPracticeStats {
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  averageSessionLength: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
}

export const usePracticeStatsById = (userId: string) => {
  const [stats, setStats] = useState<UserPracticeStats>({
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
    averageSessionLength: 0,
    weeklyMinutes: 0,
    monthlyMinutes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Get practice sessions for the user and calculate stats
      const { data: sessions, error } = await supabase
        .from('practice_sessions')
        .select('total_duration, completed_at')
        .eq('user_id', userId);

      if (error) throw error;

      if (sessions && sessions.length > 0) {
        const totalMinutes = sessions.reduce((sum, session) => sum + (session.total_duration || 0), 0);
        const totalSessions = sessions.length;
        const averageSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0;
        
        // Calculate streaks (simplified version)
        const currentStreak = 0; // Would need more complex logic to calculate actual streaks
        const longestStreak = 0; // Would need more complex logic to calculate actual streaks
        
        // Calculate weekly and monthly minutes
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const weeklyMinutes = sessions
          .filter(session => new Date(session.completed_at) >= weekAgo)
          .reduce((sum, session) => sum + (session.total_duration || 0), 0);
          
        const monthlyMinutes = sessions
          .filter(session => new Date(session.completed_at) >= monthAgo)
          .reduce((sum, session) => sum + (session.total_duration || 0), 0);

        setStats({
          totalMinutes,
          currentStreak,
          longestStreak,
          totalSessions,
          averageSessionLength,
          weeklyMinutes,
          monthlyMinutes,
        });
      }
    } catch (error) {
      console.error('Error fetching practice stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  return {
    stats,
    isLoading,
    refetch: fetchStats
  };
};