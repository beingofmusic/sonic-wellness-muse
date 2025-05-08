
import { supabase } from "@/integrations/supabase/client";
import { PracticeRoutine, RoutineBlock } from "@/types/practice";

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
): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return false;
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
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to log practice session:", err);
    return false;
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

// Get user's current practice streak
export const getCurrentStreak = async (): Promise<number> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return 0;

    const { data, error } = await supabase
      .from("practice_sessions")
      .select("completed_at")
      .eq("user_id", userData.user.id)
      .order("completed_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Sort dates in descending order (newest first)
    const practiceDates = data.map(session => {
      const date = new Date(session.completed_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    }).sort((a, b) => b - a);

    // Remove duplicates (practice sessions on same day)
    const uniqueDates = Array.from(new Set(practiceDates));

    // Check for streak
    for (let i = 0; i < uniqueDates.length; i++) {
      const practiceDate = new Date(uniqueDates[i]);
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(currentDate.getDate() - i);

      if (practiceDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
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
