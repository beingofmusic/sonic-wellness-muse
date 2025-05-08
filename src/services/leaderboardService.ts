
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek } from "date-fns";

export interface LeaderboardUser {
  user_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  total_minutes?: number;
  current_streak?: number;
}

export interface LeaderboardEntry extends LeaderboardUser {
  id: string;
  rank: number;
  value: number;
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

export const fetchWeeklyLeaderboard = async (limit = 3): Promise<LeaderboardUser[]> => {
  try {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Start from Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // End on Sunday
    
    // Use the stored function for weekly leaderboard
    const { data, error } = await supabase.rpc(
      'get_weekly_practice_leaderboard', 
      { 
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString() 
      }
    ).limit(limit);
    
    if (error) {
      console.error("Weekly leaderboard error:", error);
      return [];
    }
    
    return data || [];
    
  } catch (error) {
    console.error("Error fetching weekly leaderboard:", error);
    return [];
  }
};

export const fetchAllTimeLeaderboard = async (limit = 3): Promise<LeaderboardUser[]> => {
  try {
    // Use the stored function for all-time leaderboard
    const { data, error } = await supabase
      .rpc('get_alltime_practice_leaderboard')
      .limit(limit);
    
    if (error) {
      console.error("All-time leaderboard error:", error);
      return [];
    }
    
    return data || [];
    
  } catch (error) {
    console.error("Error fetching all-time leaderboard:", error);
    return [];
  }
};

export const fetchStreakLeaderboard = async (limit = 3): Promise<LeaderboardUser[]> => {
  try {
    // Use the stored function for streak leaderboard
    const { data, error } = await supabase
      .rpc('get_streak_leaderboard')
      .limit(limit);
    
    if (error) {
      console.error("Leaderboard error:", error);
      return [];
    }
    
    return data || [];
    
  } catch (error) {
    console.error("Error fetching streak leaderboard:", error);
    return [];
  }
};

export const fetchLeaderboardData = async (): Promise<LeaderboardData> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id;
    
    // Fetch all leaderboard data in parallel
    const [weeklyData, allTimeData, streakData] = await Promise.all([
      fetchWeeklyLeaderboard(10),
      fetchAllTimeLeaderboard(10),
      fetchStreakLeaderboard(10)
    ]);
    
    // Format the weekly time leaderboard
    const weeklyTime: LeaderboardEntry[] = weeklyData.map((entry, index) => ({
      ...entry,
      id: entry.user_id,
      rank: index + 1,
      value: entry.total_minutes || 0,
      isCurrentUser: entry.user_id === currentUserId
    }));
    
    // Format the all-time time leaderboard
    const allTimeTime: LeaderboardEntry[] = allTimeData.map((entry, index) => ({
      ...entry,
      id: entry.user_id,
      rank: index + 1,
      value: entry.total_minutes || 0,
      isCurrentUser: entry.user_id === currentUserId
    }));
    
    // Format the streak leaderboard
    const currentStreak: LeaderboardEntry[] = streakData.map((entry, index) => ({
      ...entry,
      id: entry.user_id,
      rank: index + 1,
      value: entry.current_streak || 0,
      isCurrentUser: entry.user_id === currentUserId
    }));
    
    // Find user's rank in each leaderboard
    const userRank = {
      weeklyTimeRank: weeklyTime.find(entry => entry.isCurrentUser)?.rank,
      allTimeTimeRank: allTimeTime.find(entry => entry.isCurrentUser)?.rank,
      currentStreakRank: currentStreak.find(entry => entry.isCurrentUser)?.rank
    };
    
    // Only include top 3 entries for display
    return {
      weeklyTime: weeklyTime.slice(0, 3),
      allTimeTime: allTimeTime.slice(0, 3),
      currentStreak: currentStreak.slice(0, 3),
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
      error: "Failed to load leaderboard data"
    };
  }
};
