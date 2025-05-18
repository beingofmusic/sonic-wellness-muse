
import { supabase } from "@/integrations/supabase/client";
import { PracticeRoutine, PracticeTemplate, RoutineBlock } from "@/types/practice";
import { formatDistanceToNow } from "date-fns";

export const fetchTemplates = async (limit = 3, templateId?: string): Promise<PracticeTemplate[]> => {
  let query = supabase
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
    .or('is_template.eq.true,visibility.eq.public');
  
  // If a specific templateId is provided, filter by it
  if (templateId) {
    query = query.eq('id', templateId);
  } else {
    query = query.order("created_at", { ascending: false }).limit(limit);
  }

  const { data, error } = await query;

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
      // Ensure visibility is correctly typed
      visibility: (template.visibility || 'private') as 'public' | 'private',
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
      // Ensure visibility is correctly typed
      visibility: (routine.visibility || 'private') as 'public' | 'private',
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
  // Query for the routine and join with profiles for creator info
  const { data, error } = await supabase
    .from("routines")
    .select(`
      *,
      profiles(first_name, last_name)
    `)
    .eq("id", routineId)
    .single();

  if (error) {
    console.error("Error fetching routine:", error);
    throw error;
  }

  // Get current user for authorization check
  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData?.user?.id;
  
  // Verify access permission - FIXED to allow access to public routines
  // Allow access if:
  // 1. The routine is public OR
  // 2. The user is the creator
  const isPublic = data.visibility === 'public';
  const isCreator = currentUserId && data.created_by === currentUserId;
  
  if (!isPublic && !isCreator) {
    throw new Error("You don't have permission to access this routine");
  }

  // Get creator name from the profiles join
  const profile = data.profiles as { first_name: string | null, last_name: string | null } | null;
  const creatorName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Team member'
    : 'Team member';

  return {
    ...data,
    // Ensure visibility is correctly typed
    visibility: (data.visibility || 'private') as 'public' | 'private',
    lastUpdated: formatDistanceToNow(new Date(data.updated_at), { addSuffix: true }),
    creator: creatorName
  };
};

export const createRoutine = async (
  routine: {
    title: string;
    description?: string;
    is_template: boolean;
    tags?: string[];
    visibility: 'public' | 'private';
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

  return {
    ...data,
    // Ensure visibility is correctly typed
    visibility: (data.visibility || 'private') as 'public' | 'private',
  };
};

export const updateRoutine = async (
  routineId: string,
  updates: {
    title?: string;
    description?: string;
    duration?: number;
    tags?: string[];
    visibility?: 'public' | 'private';
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
