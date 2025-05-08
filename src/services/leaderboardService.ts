
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek } from "date-fns";

export interface LeaderboardEntry {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  value: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface LeaderboardData {
  weeklyTime: LeaderboardEntry[];
  allTimeTime: LeaderboardEntry[];
  currentStreak: LeaderboardEntry[];
  userRank: {
    weeklyTimeRank?: number;
    allTimeTimeRank?: number;
    currentStreakRank?: number;
  };
  loading: boolean;
  error: string | null;
}

export const fetchLeaderboardData = async (): Promise<LeaderboardData> => {
  try {
    const { data: currentUserData } = await supabase.auth.getUser();
    const currentUserId = currentUserData?.user?.id;
    
    if (!currentUserId) {
      return {
        weeklyTime: [],
        allTimeTime: [],
        currentStreak: [],
        userRank: {},
        loading: false,
        error: "User not authenticated"
      };
    }
    
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString(); // Start from Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();
    
    // Weekly practice time query
    const { data: weeklyData, error: weeklyError } = await supabase.rpc(
      'get_weekly_practice_leaderboard',
      { week_start: weekStart, week_end: weekEnd }
    );
    
    // All-time practice time query
    const { data: allTimeData, error: allTimeError } = await supabase.rpc(
      'get_alltime_practice_leaderboard'
    );
    
    // Current streak query
    const { data: streakData, error: streakError } = await supabase.rpc(
      'get_streak_leaderboard'
    );
    
    if (weeklyError || allTimeError || streakError) {
      console.error("Leaderboard error:", weeklyError || allTimeError || streakError);
      return {
        weeklyTime: [],
        allTimeTime: [],
        currentStreak: [],
        userRank: {},
        loading: false,
        error: "Failed to fetch leaderboard data"
      };
    }
    
    // Process weekly time data
    const weeklyEntries: LeaderboardEntry[] = (weeklyData || []).slice(0, 3).map((entry, index) => ({
      id: entry.user_id,
      username: entry.username || `User ${entry.user_id.slice(0, 4)}`,
      first_name: entry.first_name,
      last_name: entry.last_name,
      avatar_url: entry.avatar_url,
      value: entry.total_minutes,
      rank: index + 1,
      isCurrentUser: entry.user_id === currentUserId
    }));
    
    // Process all-time time data
    const allTimeEntries: LeaderboardEntry[] = (allTimeData || []).slice(0, 3).map((entry, index) => ({
      id: entry.user_id,
      username: entry.username || `User ${entry.user_id.slice(0, 4)}`,
      first_name: entry.first_name,
      last_name: entry.last_name,
      avatar_url: entry.avatar_url,
      value: entry.total_minutes,
      rank: index + 1,
      isCurrentUser: entry.user_id === currentUserId
    }));
    
    // Process streak data
    const streakEntries: LeaderboardEntry[] = (streakData || []).slice(0, 3).map((entry, index) => ({
      id: entry.user_id,
      username: entry.username || `User ${entry.user_id.slice(0, 4)}`,
      first_name: entry.first_name,
      last_name: entry.last_name,
      avatar_url: entry.avatar_url,
      value: entry.current_streak,
      rank: index + 1,
      isCurrentUser: entry.user_id === currentUserId
    }));
    
    // Find current user's rank in each category if not in top 3
    const userRank = {
      weeklyTimeRank: (weeklyData || []).findIndex(entry => entry.user_id === currentUserId) + 1 || undefined,
      allTimeTimeRank: (allTimeData || []).findIndex(entry => entry.user_id === currentUserId) + 1 || undefined,
      currentStreakRank: (streakData || []).findIndex(entry => entry.user_id === currentUserId) + 1 || undefined,
    };
    
    return {
      weeklyTime: weeklyEntries,
      allTimeTime: allTimeEntries,
      currentStreak: streakEntries,
      userRank,
      loading: false,
      error: null
    };
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return {
      weeklyTime: [],
      allTimeTime: [],
      currentStreak: [],
      userRank: {},
      loading: false,
      error: "Failed to fetch leaderboard data"
    };
  }
};
