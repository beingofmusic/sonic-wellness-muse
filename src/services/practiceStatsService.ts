import { supabase } from "@/integrations/supabase/client";
import { PracticeRoutine, RoutineBlock } from "@/types/practice";
import { startOfDay, isYesterday, differenceInCalendarDays } from "date-fns";
import { checkForNewBadges } from "@/services/courseService";

export interface PracticeSession {
  id: string;
  user_id: string;
  routine_id: string | null;
  total_duration: number;
  block_breakdown: Record<string, any> | null;
  completed_at: string;
}

export interface PracticeStats {
  totalPracticeMinutes: number;
  currentStreak: number;
  sessionCount: number;
  routineUsage: Record<string, number>;
  blockTypeBreakdown: Record<string, number>;
}

// Save a completed practice session
export const logPracticeSession = async (
  routineId: string,
  totalDuration: number,
  blocks: RoutineBlock[]
): Promise<{ success: boolean, newBadges: any[] }> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { success: false, newBadges: [] };
    }

    // Create block breakdown data
    const blockBreakdown = {
      blockCount: blocks.length,
      blockTypes: blocks.reduce((acc: Record<string, number>, block) => {
        acc[block.type] = (acc[block.type] || 0) + block.duration;
        return acc;
      }, {})
    };

    const { error } = await supabase.from("practice_sessions").insert({
      user_id: userData.user.id,
      routine_id: routineId,
      total_duration: totalDuration,
      block_breakdown: blockBreakdown,
    });

    if (error) {
      console.error("Error logging practice session:", error);
      return { success: false, newBadges: [] };
    }

    // Check for newly earned badges after logging the practice session
    const newBadges = await checkForNewBadges(userData.user.id);
    
    return { success: true, newBadges };
  } catch (err) {
    console.error("Failed to log practice session:", err);
    return { success: false, newBadges: [] };
  }
};

// Get user's total practice time (in minutes)
export const getTotalPracticeTime = async (): Promise<number> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return 0;

    const { data, error } = await supabase
      .from("practice_sessions")
      .select("total_duration")
      .eq("user_id", userData.user.id);

    if (error) {
      console.error("Error fetching practice time:", error);
      return 0;
    }

    return data?.reduce((total, session) => total + session.total_duration, 0) || 0;
  } catch (error) {
    console.error("Failed to get total practice time:", error);
    return 0;
  }
};

// Get user's current practice streak (improved version)
export const getCurrentStreak = async (): Promise<number> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return 0;

    // Fetch practice sessions sorted by date
    const { data, error } = await supabase
      .from("practice_sessions")
      .select("completed_at")
      .eq("user_id", userData.user.id)
      .order("completed_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return 0;
    }

    // Current date at start of day (UTC)
    const today = startOfDay(new Date());
    let streak = 0;
    let lastCheckedDate: Date | null = null;
    
    // Get all unique practice dates (multiple sessions in one day count as one)
    const practiceDates = data.map(session => {
      return startOfDay(new Date(session.completed_at));
    });
    
    // Sort dates in descending order and remove duplicates
    const uniqueDates = Array.from(new Set(
      practiceDates.map(date => date.toISOString())
    ))
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => b.getTime() - a.getTime());
    
    if (uniqueDates.length === 0) {
      return 0;
    }
    
    // Check if most recent practice was today or yesterday
    const mostRecentPractice = uniqueDates[0];
    const daysSinceLastPractice = differenceInCalendarDays(today, mostRecentPractice);
    
    // If last practice was more than a day ago (not today, not yesterday)
    // And not the current day, the streak is broken
    if (daysSinceLastPractice > 1) {
      return 1; // Return 1 for the most recent practice day
    }
    
    // Calculate streak by checking for consecutive days
    streak = 1; // Start with 1 for the most recent day
    lastCheckedDate = mostRecentPractice;
    
    // Loop through dates starting from the second most recent
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = uniqueDates[i];
      
      // If this date is exactly one day before the last checked date
      if (lastCheckedDate && differenceInCalendarDays(lastCheckedDate, currentDate) === 1) {
        streak++;
        lastCheckedDate = currentDate;
      } 
      // If this is the same day we already counted, just update lastCheckedDate
      else if (lastCheckedDate && differenceInCalendarDays(lastCheckedDate, currentDate) === 0) {
        lastCheckedDate = currentDate;
      }
      // If we found a gap, stop counting
      else {
        break;
      }
    }
    
    return streak;
  } catch (error) {
    console.error("Failed to get practice streak:", error);
    return 0;
  }
};

// Get count of completed sessions
export const getCompletedSessionsCount = async (): Promise<number> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return 0;

    const { count, error } = await supabase
      .from("practice_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userData.user.id);

    if (error) {
      console.error("Error fetching session count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Failed to get session count:", error);
    return 0;
  }
};

// Get all stats in a single query for dashboard
export const fetchPracticeStats = async (): Promise<PracticeStats> => {
  try {
    const [
      totalMinutes,
      streak,
      sessionCount
    ] = await Promise.all([
      getTotalPracticeTime(),
      getCurrentStreak(),
      getCompletedSessionsCount()
    ]);
    
    return {
      totalPracticeMinutes: totalMinutes,
      currentStreak: streak,
      sessionCount: sessionCount,
      routineUsage: {}, // Will be populated in future implementation
      blockTypeBreakdown: {} // Will be populated in future implementation
    };
  } catch (error) {
    console.error("Error fetching practice stats:", error);
    return {
      totalPracticeMinutes: 0,
      currentStreak: 0,
      sessionCount: 0,
      routineUsage: {},
      blockTypeBreakdown: {}
    };
  }
};
