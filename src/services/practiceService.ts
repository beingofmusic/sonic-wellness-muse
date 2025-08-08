import { supabase } from "@/integrations/supabase/client";
import { PracticeRoutine, PracticeTemplate, RoutineBlock } from "@/types/practice";
import { formatDistanceToNow } from "date-fns";

// Helper: get orphan template ids (templates/public routines with zero blocks)
export const getOrphanTemplateIds = async (): Promise<Set<string>> => {
  const { data, error } = await supabase.rpc("get_orphan_templates");
  if (error) {
    console.error("Error fetching orphan templates:", error);
    return new Set();
  }
  const ids = (Array.isArray(data) ? data : []).map((row: any) => String(row.routine_id));
  return new Set(ids);
};

export const fetchTemplates = async (limit = 3): Promise<PracticeTemplate[]> => {
  const { data, error } = await supabase
    .from("routines")
    .select(`
      id, 
      title, 
      description, 
      duration, 
      tags,
      created_by,
      is_template,
      visibility,
      created_at,
      updated_at,
      profiles(first_name, last_name)
    `)
    .or("is_template.eq.true,visibility.eq.public")
    .neq("visibility", "private")
    .order("created_at", { ascending: false })
    .limit(limit * 2); // fetch a bit extra to account for filtering

  if (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }

  // Filter out orphans (no blocks)
  const orphanIds = await getOrphanTemplateIds();
  const valid = (data || []).filter((t: any) => !orphanIds.has(String(t.id))).slice(0, limit);

  // Transform the data to match our frontend type
  return valid.map((template: any) => {
    const profile = template.profiles as { first_name: string | null; last_name: string | null };
    const creatorName = profile
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Team member"
      : "Team member";

    const includes = ["Warm-up exercise", "Technical drill", "Mindfulness practice"];

    return {
      ...template,
      creator: creatorName,
      usageCount: Math.floor(Math.random() * 500),
      includes,
    } as PracticeTemplate;
  });
};

export const fetchAllTemplates = async (
  page = 1,
  pageSize = 12
): Promise<{ templates: PracticeTemplate[]; totalCount: number }> => {
  // Get total count first
  const { count, error: countError } = await supabase
    .from("routines")
    .select("*", { count: "exact", head: true })
    .or("is_template.eq.true,visibility.eq.public")
    .neq("visibility", "private");

  if (countError) {
    console.error("Error fetching templates count:", countError);
    throw countError;
  }

  // Get paginated data
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("routines")
    .select(`
      id, 
      title, 
      description, 
      duration, 
      tags,
      created_by,
      is_template,
      visibility,
      created_at,
      updated_at,
      profiles(first_name, last_name)
    `)
    .or("is_template.eq.true,visibility.eq.public")
    .neq("visibility", "private")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching all templates:", error);
    throw error;
  }

  // Filter out orphans (no blocks)
  const orphanIds = await getOrphanTemplateIds();
  const filtered = (data || []).filter((t: any) => !orphanIds.has(String(t.id)));

  // Transform the data to match our frontend type
  const templates = filtered.map((template: any) => {
    const profile = template.profiles as { first_name: string | null; last_name: string | null };
    const creatorName = profile
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Team member"
      : "Team member";

    const includes = ["Warm-up exercise", "Technical drill", "Mindfulness practice"];

    return {
      ...template,
      creator: creatorName,
      usageCount: Math.floor(Math.random() * 500),
      includes,
    } as PracticeTemplate;
  });

  // Adjust total count by excluding all known orphans (approximate but consistent)
  const adjustedTotal = Math.max(0, (count || 0) - orphanIds.size);

  return {
    templates,
    totalCount: adjustedTotal,
  };
};

export const fetchUserRoutines = async (): Promise<PracticeRoutine[]> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user) {
    return [];
  }
  
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("created_by", user.user.id)
    .eq("is_template", false)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching user routines:", error);
    throw error;
  }

  return data.map(routine => {
    return {
      ...routine,
      // Format the last updated time for display
      lastUpdated: formatDistanceToNow(new Date(routine.updated_at), { addSuffix: true })
    };
  });
};

export const fetchRoutineBlocks = async (routineId: string): Promise<RoutineBlock[]> => {
  const { data, error } = await supabase
    .from("routine_blocks")
    .select("*")
    .eq("routine_id", routineId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching routine blocks:", error);
    throw error;
  }

  return data as RoutineBlock[];
};

export const fetchRoutineById = async (routineId: string): Promise<PracticeRoutine> => {
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("id", routineId)
    .single();

  if (error) {
    console.error("Error fetching routine:", error);
    throw error;
  }

  return {
    ...data,
    lastUpdated: formatDistanceToNow(new Date(data.updated_at), { addSuffix: true })
  };
};

export const checkRoutineAccess = async (routineId: string): Promise<{ hasAccess: boolean; routine?: PracticeRoutine }> => {
  try {
    const routine = await fetchRoutineById(routineId);
    return { hasAccess: true, routine };
  } catch (error) {
    console.error("Error checking routine access:", error);
    return { hasAccess: false };
  }
};

export const createRoutine = async (
  routine: {
    title: string;
    description?: string;
    is_template: boolean;
    tags?: string[];
  },
  userId: string
): Promise<PracticeRoutine> => {
  const { data, error } = await supabase
    .from("routines")
    .insert({
      ...routine,
      created_by: userId,
      duration: 0, // This will be updated after blocks are added
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating routine:", error);
    throw error;
  }

  return data;
};

export const updateRoutine = async (
  routineId: string,
  updates: {
    title?: string;
    description?: string;
    duration?: number;
    tags?: string[];
  }
): Promise<void> => {
  const { error } = await supabase
    .from("routines")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", routineId);

  if (error) {
    console.error("Error updating routine:", error);
    throw error;
  }
};

export const createRoutineBlocks = async (
  blocks: {
    routine_id: string;
    type: string;
    content: string | null;
    instructions?: string | null;
    duration: number;
    order_index: number;
  }[]
): Promise<void> => {
  const { error } = await supabase
    .from("routine_blocks")
    .insert(blocks);

  if (error) {
    console.error("Error creating routine blocks:", error);
    throw error;
  }
};

export const deleteRoutineBlocks = async (routineId: string): Promise<void> => {
  const { error } = await supabase
    .from("routine_blocks")
    .delete()
    .eq("routine_id", routineId);

  if (error) {
    console.error("Error deleting routine blocks:", error);
    throw error;
  }
};

export const createPracticeSession = async (
  userId: string,
  routineId: string | null,
  totalDuration: number,
  blockBreakdown?: any
): Promise<string> => {
  const { data, error } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: userId,
      routine_id: routineId,
      total_duration: totalDuration,
      block_breakdown: blockBreakdown,
      completed_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (error) {
    console.error("Error creating practice session:", error);
    throw error;
  }

  return data.id;
};
