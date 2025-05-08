
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
