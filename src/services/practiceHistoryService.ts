
import { supabase } from "@/integrations/supabase/client";
import { PracticeSession } from "@/services/practiceStatsService";
import { formatDistanceToNow, format, startOfDay, endOfDay } from "date-fns";

export interface PracticeSessionWithRoutine extends PracticeSession {
  routine_title?: string;
  routine_tags?: string[];
  formatted_date?: string;
  formatted_time?: string;
  time_ago?: string;
  recording?: {
    id: string;
    title: string;
    recording_url: string;
    notes: string | null;
    tags: string[];
    duration_seconds: number;
    created_at: string;
  } | null;
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
      .from('routines')
      .select(`
        id,
        title,
        practice_sessions!inner (id, total_duration)
      `)
      .eq('practice_sessions.user_id', userId)
      .order('title');
    
    if (summaryError) {
      console.error("Error fetching routine summary:", summaryError);
    }
    
    // Process the routine summary data into the expected format
    const formattedRoutineSummary: RoutineSummary[] = routineSummary 
      ? routineSummary.map((routine: any) => ({
          id: routine.id,
          title: routine.title,
          count: routine.practice_sessions.length,
          totalDuration: routine.practice_sessions.reduce((sum: number, session: any) => sum + (session.total_duration || 0), 0)
        }))
      : [];
    
    // Fetch recordings for these sessions using timestamp-based matching
    const sessionIds = sessions?.map(s => s.id) || [];
    let recordings: any[] = [];
    
    if (sessionIds.length > 0) {
      // First try to get recordings linked by session_id
      const { data: linkedRecordings } = await supabase
        .from('practice_recordings')
        .select('*')
        .in('session_id', sessionIds)
        .eq('user_id', userId);

      // Then get recordings that might need timestamp-based matching
      const { data: unlinkedRecordings } = await supabase
        .from('practice_recordings')
        .select('*')
        .is('session_id', null)
        .eq('user_id', userId);

      recordings = [...(linkedRecordings || []), ...(unlinkedRecordings || [])];
    }

    // Format the sessions for display
    const formattedSessions: PracticeSessionWithRoutine[] = sessions?.map((session: any) => {
      const routine = session.routines as any;
      const completedDate = new Date(session.completed_at);
      
      // Find matching recording - first by session_id, then by timestamp proximity
      let recording = recordings.find(r => r.session_id === session.id);
      
      if (!recording) {
        // Try timestamp-based matching (within 5 minutes)
        const sessionTime = new Date(session.completed_at).getTime();
        recording = recordings.find(r => {
          if (r.session_id) return false; // Skip already linked recordings
          const recordingTime = new Date(r.created_at).getTime();
          const timeDiff = Math.abs(sessionTime - recordingTime);
          return timeDiff <= 5 * 60 * 1000; // 5 minutes tolerance
        });
      }
      
      return {
        ...session,
        routine_title: routine?.title || "Custom Session",
        routine_tags: routine?.tags || [],
        formatted_date: format(completedDate, 'MMM d, yyyy'),
        formatted_time: format(completedDate, 'h:mm a'),
        time_ago: formatDistanceToNow(completedDate, { addSuffix: true }),
        recording: recording || null
      };
    }) || [];
    
    // Check if there are more pages
    const hasMore = totalSessions ? from + formattedSessions.length < totalSessions : false;
    
    return {
      sessions: formattedSessions,
      hasMore,
      totalPracticeTime,
      totalSessions: totalSessions || 0,
      routineSummary: formattedRoutineSummary
    };
    
  } catch (error) {
    console.error("Error in fetchPracticeSessions:", error);
    throw error;
  }
};
