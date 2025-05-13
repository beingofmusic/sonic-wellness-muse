
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export interface PracticeSessionWithRoutine {
  id: string;
  user_id: string;
  routine_id: string | null;
  routine_title: string | null;
  total_duration: number;
  completed_at: string;
  block_breakdown: Record<string, any> | null;
  is_manual_entry: boolean;
}

interface SessionQueryParams {
  page?: number;
  pageSize?: number;
  dateRange?: [Date, Date] | undefined;
  routineId?: string | null;
  minDuration?: number | null;
}

interface SessionQueryResult {
  sessions: PracticeSessionWithRoutine[];
  hasMore: boolean;
  totalPracticeTime: number;
  totalSessions: number;
  routineSummary: {
    id: string;
    title: string;
    count: number;
    totalDuration: number;
  }[];
}

export const fetchPracticeSessions = async ({
  page = 0,
  pageSize = 10,
  dateRange,
  routineId,
  minDuration,
}: SessionQueryParams): Promise<SessionQueryResult> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { sessions: [], hasMore: false, totalPracticeTime: 0, totalSessions: 0, routineSummary: [] };
  }

  // Build the base query
  let query = supabase
    .from("practice_sessions")
    .select(`
      id,
      user_id,
      routine_id,
      total_duration,
      completed_at,
      block_breakdown,
      routines (
        title
      )
    `)
    .eq("user_id", userData.user.id)
    .order("completed_at", { ascending: false });

  // Apply filters if provided
  if (dateRange && dateRange.length === 2) {
    const [startDate, endDate] = dateRange;
    query = query
      .gte("completed_at", startDate.toISOString())
      .lte("completed_at", new Date(endDate.setHours(23, 59, 59, 999)).toISOString());
  }

  if (routineId) {
    query = query.eq("routine_id", routineId);
  }

  if (minDuration !== null && minDuration !== undefined) {
    query = query.gte("total_duration", minDuration);
  }

  // Clone the query for pagination and total count
  const countQuery = query;
  const paginatedQuery = query.range(page * pageSize, (page + 1) * pageSize - 1);

  // Execute queries in parallel
  const [sessionResult, countResult, totalTimeResult, routineSummary] = await Promise.all([
    paginatedQuery,
    countQuery.count().single(),
    // Total practice time with applied filters
    countQuery.select("total_duration"),
    // Get summary of routine usage
    buildRoutineSummary(userData.user.id, dateRange),
  ]);

  if (sessionResult.error || countResult.error || totalTimeResult.error) {
    console.error("Error fetching sessions:", sessionResult.error || countResult.error || totalTimeResult.error);
    throw new Error("Failed to load practice history");
  }

  // Transform the sessions data
  const sessions: PracticeSessionWithRoutine[] = (sessionResult.data || []).map((session) => {
    const routineData = session.routines as { title: string } | null;
    
    // Check if this is a manual entry
    const isManualEntry = session.block_breakdown && session.block_breakdown.isManualEntry === true;
    
    // Determine routine title
    let routineTitle: string | null = null;
    if (isManualEntry) {
      routineTitle = "External Practice";
    } else if (routineData && routineData.title) {
      routineTitle = routineData.title;
    }

    return {
      id: session.id,
      user_id: session.user_id,
      routine_id: session.routine_id,
      routine_title: routineTitle,
      total_duration: session.total_duration,
      completed_at: session.completed_at,
      block_breakdown: session.block_breakdown,
      is_manual_entry: isManualEntry,
    };
  });

  // Calculate total time from the results
  const totalPracticeTime = totalTimeResult.data.reduce((sum, item) => sum + item.total_duration, 0);
  
  // Determine if there are more results
  const totalCount = countResult.data?.count || 0;
  const hasMore = totalCount > (page + 1) * pageSize;

  return {
    sessions,
    hasMore,
    totalPracticeTime,
    totalSessions: totalCount,
    routineSummary,
  };
};

async function buildRoutineSummary(userId: string, dateRange?: [Date, Date]) {
  let query = supabase.from("practice_sessions")
    .select(`
      routine_id,
      total_duration,
      routines (title)
    `)
    .eq("user_id", userId)
    .not("routine_id", "is", null); // Only include sessions linked to routines

  // Apply date range filter if provided
  if (dateRange && dateRange.length === 2) {
    const [startDate, endDate] = dateRange;
    query = query
      .gte("completed_at", startDate.toISOString())
      .lte("completed_at", new Date(endDate.setHours(23, 59, 59, 999)).toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching routine summary:", error);
    return [];
  }

  // Group by routine_id and calculate count and total duration
  const summary = data.reduce((acc: Record<string, any>, session) => {
    if (session.routine_id && session.routines) {
      if (!acc[session.routine_id]) {
        acc[session.routine_id] = {
          id: session.routine_id,
          title: (session.routines as { title: string }).title,
          count: 0,
          totalDuration: 0,
        };
      }
      acc[session.routine_id].count += 1;
      acc[session.routine_id].totalDuration += session.total_duration;
    }
    return acc;
  }, {});

  // Get manual entry count if any
  const { data: manualData, error: manualError } = await supabase
    .from("practice_sessions")
    .select("id, total_duration")
    .eq("user_id", userId)
    .is("routine_id", null)
    .filter("block_breakdown->isManualEntry", "eq", true);

  if (!manualError && manualData && manualData.length > 0) {
    const manualTotalDuration = manualData.reduce((sum, item) => sum + item.total_duration, 0);
    summary["manual"] = {
      id: "manual",
      title: "External Practice",
      count: manualData.length,
      totalDuration: manualTotalDuration,
    };
  }

  // Convert to array and sort by usage count (descending)
  return Object.values(summary).sort((a: any, b: any) => b.count - a.count);
}

// Format the duration from minutes to a readable string
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Format date in a human-readable way
export const formatSessionDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return "Unknown date";
  }
};
