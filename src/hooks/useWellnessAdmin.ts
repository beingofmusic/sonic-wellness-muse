import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WellnessPractice, JournalPrompt } from "@/types/wellness";

// Wellness Practice Admin Hooks
export const useCreateWellnessPractice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<WellnessPractice, 'id'>) => {
      const { data: practice, error } = await supabase
        .from('wellness_practices')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return practice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wellness-practices"] });
    },
  });
};

export const useUpdateWellnessPractice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<WellnessPractice>) => {
      const { data: practice, error } = await supabase
        .from('wellness_practices')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return practice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wellness-practices"] });
    },
  });
};

export const useDeleteWellnessPractice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wellness_practices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wellness-practices"] });
    },
  });
};

// Journal Prompt Admin Hooks
export const useCreateJournalPrompt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<JournalPrompt, 'id'>) => {
      const { data: prompt, error } = await supabase
        .from('journal_prompts')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return prompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-prompts"] });
    },
  });
};

export const useUpdateJournalPrompt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<JournalPrompt>) => {
      const { data: prompt, error } = await supabase
        .from('journal_prompts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return prompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-prompts"] });
    },
  });
};

export const useDeleteJournalPrompt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('journal_prompts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-prompts"] });
    },
  });
};