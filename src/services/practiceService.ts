
import { supabase } from "@/integrations/supabase/client";
import { PracticeRoutine, PracticeTemplate, RoutineBlock } from "@/types/practice";
import { formatDistanceToNow } from "date-fns";

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
      created_at,
      updated_at,
      profiles(first_name, last_name)
    `)
    .eq("is_template", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }

  // Transform the data to match our frontend type
  return data.map(template => {
    const profile = template.profiles as { first_name: string | null, last_name: string | null };
    const creatorName = profile ? 
      `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Team member' : 
      'Team member';
    
    // Just placeholder data for now until we implement the blocks
    const includes = ["Warm-up exercise", "Technical drill", "Mindfulness practice"];
    
    return {
      ...template,
      creator: creatorName,
      usageCount: Math.floor(Math.random() * 500), // Placeholder until we track this
      includes
    } as PracticeTemplate;
  });
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
