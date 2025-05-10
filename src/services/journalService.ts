
import { supabase } from "@/integrations/supabase/client";
import { JournalEntry, JournalPrompt, JournalSectionType, SectionProgress } from "@/types/journal";
import { toast } from "sonner";

// Fetch all journal prompts by section
export const fetchJournalPrompts = async (section?: JournalSectionType): Promise<JournalPrompt[]> => {
  try {
    let query = supabase
      .from('journal_section_prompts')
      .select('*');
    
    if (section) {
      query = query.eq('section', section);
    }
    
    const { data, error } = await query.order('order_index');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching journal prompts:", error);
    return [];
  }
};

// Fetch a single journal prompt by ID
export const fetchJournalPromptById = async (promptId: string): Promise<JournalPrompt | null> => {
  try {
    const { data, error } = await supabase
      .from('journal_section_prompts')
      .select('*')
      .eq('id', promptId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching journal prompt:", error);
    return null;
  }
};

// Fetch user's journal entries
export const fetchUserJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Not authenticated");
    }

    const { data, error } = await supabase
      .from('musical_journal_entries')
      .select(`
        *,
        journal_section_prompts (*)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform data to include prompt directly in each entry
    return (data || []).map(entry => ({
      ...entry,
      prompt: entry.journal_section_prompts as unknown as JournalPrompt
    }));
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return [];
  }
};

// Fetch a specific journal entry by prompt ID
export const fetchJournalEntryByPromptId = async (promptId: string): Promise<JournalEntry | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Not authenticated");
    }

    const { data, error } = await supabase
      .from('musical_journal_entries')
      .select(`
        *,
        journal_section_prompts (*)
      `)
      .eq('user_id', session.user.id)
      .eq('prompt_id', promptId)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) return null;
    
    return {
      ...data,
      prompt: data.journal_section_prompts as unknown as JournalPrompt
    };
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    return null;
  }
};

// Save or update a journal entry
export const saveJournalEntry = async (
  promptId: string, 
  content: string, 
  isCompleted = false
): Promise<JournalEntry | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Not authenticated");
    }

    // Check if entry exists
    const { data: existingEntry } = await supabase
      .from('musical_journal_entries')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('prompt_id', promptId)
      .maybeSingle();

    let result;
    if (existingEntry) {
      // Update existing entry
      const { data, error } = await supabase
        .from('musical_journal_entries')
        .update({ 
          content, 
          is_completed: isCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEntry.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new entry
      const { data, error } = await supabase
        .from('musical_journal_entries')
        .insert({
          user_id: session.user.id,
          prompt_id: promptId,
          content,
          is_completed: isCompleted
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    toast.success(existingEntry ? "Journal entry updated" : "Journal entry saved");
    return result;
  } catch (error) {
    console.error("Error saving journal entry:", error);
    toast.error("Failed to save journal entry");
    return null;
  }
};

// Get progress for all sections or a specific section
export const fetchJournalSectionProgress = async (section?: JournalSectionType): Promise<SectionProgress[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Not authenticated");
    }

    // First get all prompts by section to calculate total
    const { data: promptsData, error: promptsError } = await supabase
      .from('journal_section_prompts')
      .select('section, id');
      
    if (promptsError) throw promptsError;

    // Then get user's completed entries by section
    const { data: entriesData, error: entriesError } = await supabase
      .from('musical_journal_entries')
      .select(`
        prompt_id,
        journal_section_prompts (section)
      `)
      .eq('user_id', session.user.id)
      .eq('is_completed', true);

    if (entriesError) throw entriesError;

    // Count prompts by section
    const sections = ['past', 'present', 'future'] as JournalSectionType[];
    const sectionCounts: Record<string, number> = {};
    
    // Calculate totals for each section
    if (promptsData) {
      for (const sectionType of sections) {
        const sectionData = promptsData.filter(row => row.section === sectionType);
        sectionCounts[sectionType] = sectionData.length;
      }
    }
    
    // Count completed entries by section
    const completedBySection: Record<string, number> = {};
    for (const entry of (entriesData || [])) {
      const sectionInfo = entry.journal_section_prompts as any;
      if (sectionInfo && sectionInfo.section) {
        const section = sectionInfo.section;
        completedBySection[section] = (completedBySection[section] || 0) + 1;
      }
    }
    
    // Create final progress array
    const progress: SectionProgress[] = sections
      .filter(s => !section || s === section)
      .map(s => ({
        section: s,
        total_prompts: sectionCounts[s] || 0,
        completed_prompts: completedBySection[s] || 0,
        completion_percentage: sectionCounts[s] 
          ? Math.round((completedBySection[s] || 0) * 100 / sectionCounts[s]) 
          : 0
      }));
      
    return progress;
  } catch (error) {
    console.error("Error fetching journal progress:", error);
    return [];
  }
};
