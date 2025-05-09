
import { supabase } from "@/integrations/supabase/client";
import { 
  WellnessPractice, 
  JournalPrompt, 
  WellnessStats, 
  WellnessSession, 
  JournalEntry,
  WellnessGoal 
} from "@/types/wellness";

export const fetchWellnessStats = async (): Promise<WellnessStats> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Not authenticated");
    }

    const { data, error } = await supabase.rpc('get_wellness_stats', {
      user_uuid: session.user.id
    });

    if (error) throw error;
    if (!data || data.length === 0) {
      // Return default stats if none exist
      return {
        total_sessions: 0,
        total_minutes: 0,
        current_streak: 0,
        total_journal_entries: 0,
        weekly_minutes_goal: 60
      };
    }

    return data[0];
  } catch (error) {
    console.error("Error fetching wellness stats:", error);
    throw error;
  }
};

export const fetchWellnessPractices = async (type?: string): Promise<WellnessPractice[]> => {
  try {
    let query = supabase.from('wellness_practices').select('*');
    
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query.order('title');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching wellness practices:", error);
    return [];
  }
};

export const fetchJournalPrompts = async (type?: string): Promise<JournalPrompt[]> => {
  try {
    let query = supabase.from('journal_prompts').select('*');
    
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query.order('title');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching journal prompts:", error);
    return [];
  }
};

export const fetchWellnessPracticeById = async (id: string): Promise<WellnessPractice | null> => {
  try {
    const { data, error } = await supabase
      .from('wellness_practices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching wellness practice:", error);
    return null;
  }
};

export const fetchJournalPromptById = async (id: string): Promise<JournalPrompt | null> => {
  try {
    const { data, error } = await supabase
      .from('journal_prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching journal prompt:", error);
    return null;
  }
};

export const saveWellnessSession = async (practiceId: string, durationMinutes: number): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Not authenticated");
    }

    const { error } = await supabase
      .from('wellness_sessions')
      .insert({
        user_id: session.user.id,
        practice_id: practiceId,
        duration_minutes: durationMinutes
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving wellness session:", error);
    return false;
  }
};

export const saveJournalEntry = async (promptId: string | null, content: string): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Not authenticated");
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: session.user.id,
        prompt_id: promptId,
        content: content
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error saving journal entry:", error);
    return null;
  }
};

export const updateJournalEntry = async (entryId: string, content: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Not authenticated");
    }

    const { error } = await supabase
      .from('journal_entries')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', entryId)
      .eq('user_id', session.user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating journal entry:", error);
    return false;
  }
};

export const fetchJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Not authenticated");
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        journal_prompts (
          title,
          description,
          type
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return [];
  }
};

export const updateWellnessGoal = async (weeklyMinutesGoal: number): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Not authenticated");
    }

    // Check if a goal already exists for this user
    const { data: existingGoal } = await supabase
      .from('wellness_goals')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (existingGoal) {
      // Update existing goal
      const { error } = await supabase
        .from('wellness_goals')
        .update({ weekly_minutes_goal: weeklyMinutesGoal })
        .eq('id', existingGoal.id);

      if (error) throw error;
    } else {
      // Create new goal
      const { error } = await supabase
        .from('wellness_goals')
        .insert({
          user_id: session.user.id,
          weekly_minutes_goal: weeklyMinutesGoal
        });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error("Error updating wellness goal:", error);
    return false;
  }
};
