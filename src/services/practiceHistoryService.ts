
import { supabase } from "@/integrations/supabase/client";
import { PracticeSession } from "@/services/practiceStatsService";
import { formatDistanceToNow, format, startOfDay, endOfDay } from "date-fns";

export interface PracticeSessionWithRoutine extends PracticeSession {
  routine_title?: string;
  routine_tags?: string[];
  formatted_date?: string;
  formatted_time?: string;
  time_ago?: string;
}

interface FetchPracticeSessionsOptions {
  page?: number;
  pageSize?: number;
  dateRange?: [Date, Date];
  routineId?: string | null;
  minDuration?: number | null;
}

interface RoutineSummary {
  id: string;
  title: string | null;
  count: number;
  totalDuration: number;
}

interface PracticeSessionsResult {
  sessions: PracticeSessionWithRoutine[];
  hasMore: boolean;
  totalPracticeTime: number;
  totalSessions: number;
  routineSummary: RoutineSummary[];
}

export const fetchPracticeSessions = async ({
  page = 0,
  pageSize = 10,
  dateRange,
  routineId,
  minDuration
}: FetchPracticeSessionsOptions = {}): Promise<PracticeSessionsResult> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }
    
    const userId = userData.user.id;
    
    // Build query for sessions
    let query = supabase
      .from("practice_sessions")
      .select(`
        *,
        routines (
          id,
          title,
          tags
        )
      `)
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });
    
    // Apply filters
    if (dateRange) {
      query = query
        .gte("completed_at", startOfDay(dateRange[0]).toISOString())
        .lte("completed_at", dateRange[1] ? endOfDay(dateRange[1]).toISOString() : endOfDay(new Date()).toISOString());
    }
    
    if (routineId) {
      query = query.eq("routine_id", routineId);
    }
    
    if (minDuration && minDuration > 0) {
      query = query.gte("total_duration", minDuration);
    }
    
    // Execute count query first
    const countQuery = supabase
      .from("practice_sessions")
      .select("id", { count: "exact" })
      .eq("user_id", userId);
      
    // Apply the same filters to count query
    if (dateRange) {
      countQuery.gte("completed_at", startOfDay(dateRange[0]).toISOString())
        .lte("completed_at", dateRange[1] ? endOfDay(dateRange[1]).toISOString() : endOfDay(new Date()).toISOString());
    }
    
    if (routineId) {
      countQuery.eq("routine_id", routineId);
    }
    
    if (minDuration && minDuration > 0) {
      countQuery.gte("total_duration", minDuration);
    }
    
    const { count: totalSessions, error: countError } = await countQuery;
    
    if (countError) {
      console.error("Error counting practice sessions:", countError);
      throw countError;
    }
    
    // Add pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    // Execute query
    const { data: sessions, error } = await query;
    
    if (error) {
      console.error("Error fetching practice sessions:", error);
      throw error;
    }
    
    // Calculate total practice time
    let totalQuery = supabase
      .from("practice_sessions")
      .select("total_duration")
      .eq("user_id", userId);
    
    // Apply the same filters for total time calculation
    if (dateRange) {
      totalQuery = totalQuery
        .gte("completed_at", startOfDay(dateRange[0]).toISOString())
        .lte("completed_at", dateRange[1] ? endOfDay(dateRange[1]).toISOString() : endOfDay(new Date()).toISOString());
    }
    
    if (routineId) {
      totalQuery = totalQuery.eq("routine_id", routineId);
    }
    
    if (minDuration && minDuration > 0) {
      totalQuery = totalQuery.gte("total_duration", minDuration);
    }
    
    const { data: timeData } = await totalQuery;
    const totalPracticeTime = timeData?.reduce((sum, session) => sum + (session.total_duration || 0), 0) || 0;
    
    // Get routine summary
    const { data: routineSummary, error: summaryError } = await supabase
      .rpc('get_routine_practice_summary', { user_id_param: userId });
    
    if (summaryError) {
      console.error("Error fetching routine summary:", summaryError);
    }
    
    // Format the sessions for display
    const formattedSessions: PracticeSessionWithRoutine[] = sessions?.map(session => {
      const routine = session.routines as any;
      const completedDate = new Date(session.completed_at);
      
      return {
        ...session,
        routine_title: routine?.title || "Custom Session",
        routine_tags: routine?.tags || [],
        formatted_date: format(completedDate, 'MMM d, yyyy'),
        formatted_time: format(completedDate, 'h:mm a'),
        time_ago: formatDistanceToNow(completedDate, { addSuffix: true }),
      };
    }) || [];
    
    // Check if there are more pages
    const hasMore = totalSessions ? from + formattedSessions.length < totalSessions : false;
    
    return {
      sessions: formattedSessions,
      hasMore,
      totalPracticeTime,
      totalSessions: totalSessions || 0,
      routineSummary: routineSummary || []
    };
    
  } catch (error) {
    console.error("Error in fetchPracticeSessions:", error);
    throw error;
  }
};
