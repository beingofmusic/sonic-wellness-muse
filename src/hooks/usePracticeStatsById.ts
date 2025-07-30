import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserPracticeStats {
  totalPracticeTime: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  averageSessionLength: number;
  thisWeekMinutes: number;
  thisMonthMinutes: number;
}

export const usePracticeStatsById = (userId: string) => {
  const [stats, setStats] = useState<UserPracticeStats>({
    totalPracticeTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
    averageSessionLength: 0,
    thisWeekMinutes: 0,
    thisMonthMinutes: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!userId) {
        setError('No user ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get practice sessions for the user
        const { data: sessions, error: sessionsError } = await supabase
          .from('practice_sessions')
          .select('total_duration, completed_at')
          .eq('user_id', userId)
          .order('completed_at', { ascending: true });

        if (sessionsError) {
          throw sessionsError;
        }

        if (!sessions || sessions.length === 0) {
          setStats({
            totalPracticeTime: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalSessions: 0,
            averageSessionLength: 0,
            thisWeekMinutes: 0,
            thisMonthMinutes: 0
          });
          setIsLoading(false);
          return;
        }

        // Calculate stats
        const totalMinutes = sessions.reduce((sum, session) => sum + session.total_duration, 0);
        const totalSessions = sessions.length;
        const averageSessionLength = totalMinutes / totalSessions;

        // Calculate streaks (simplified logic)
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        const today = new Date();
        const sessionDates = sessions.map(s => new Date(s.completed_at).toDateString());
        const uniqueDates = [...new Set(sessionDates)].sort();
        
        for (let i = uniqueDates.length - 1; i >= 0; i--) {
          const sessionDate = new Date(uniqueDates[i]);
          const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === currentStreak) {
            currentStreak++;
          } else {
            break;
          }
        }

        // Calculate longest streak (simplified)
        longestStreak = Math.max(currentStreak, uniqueDates.length > 3 ? 3 : uniqueDates.length);

        // Calculate this week and month minutes
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const thisWeekMinutes = sessions
          .filter(s => new Date(s.completed_at) >= weekAgo)
          .reduce((sum, s) => sum + s.total_duration, 0);
          
        const thisMonthMinutes = sessions
          .filter(s => new Date(s.completed_at) >= monthAgo)
          .reduce((sum, s) => sum + s.total_duration, 0);

        setStats({
          totalPracticeTime: totalMinutes,
          currentStreak,
          longestStreak,
          totalSessions,
          averageSessionLength,
          thisWeekMinutes,
          thisMonthMinutes
        });

      } catch (error) {
        console.error('Error fetching user practice stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to load practice stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, [userId]);

  return {
    stats,
    isLoading,
    error
  };
};