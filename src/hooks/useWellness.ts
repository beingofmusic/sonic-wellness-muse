
import { useState, useEffect } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchWellnessStats, 
  fetchWellnessPractices, 
  fetchJournalPrompts,
  saveWellnessSession,
  saveJournalEntry,
  updateJournalEntry,
  fetchJournalEntries,
  updateWellnessGoal
} from "@/services/wellnessService";

export const useWellnessStats = () => {
  return useQuery({
    queryKey: ["wellness-stats"],
    queryFn: fetchWellnessStats,
    refetchOnWindowFocus: false,
  });
};

export const useWellnessPractices = (type: string = 'all') => {
  return useQuery({
    queryKey: ["wellness-practices", type],
    queryFn: () => fetchWellnessPractices(type),
    refetchOnWindowFocus: false,
  });
};

export const useJournalPrompts = (type: string = 'all') => {
  return useQuery({
    queryKey: ["journal-prompts", type],
    queryFn: () => fetchJournalPrompts(type),
    refetchOnWindowFocus: false,
  });
};

export const useJournalEntries = () => {
  return useQuery({
    queryKey: ["journal-entries"],
    queryFn: fetchJournalEntries,
    refetchOnWindowFocus: false,
  });
};

export const useCompleteWellnessSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ practiceId, durationMinutes }: 
      { practiceId: string, durationMinutes: number }) => {
      return saveWellnessSession(practiceId, durationMinutes);
    },
    onSuccess: () => {
      toast.success("Wellness session completed");
      queryClient.invalidateQueries({ queryKey: ["wellness-stats"] });
    },
    onError: () => {
      toast.error("Failed to save wellness session");
    },
  });
};

export const useSaveJournalEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ promptId, content }: 
      { promptId: string | null, content: string }) => {
      return saveJournalEntry(promptId, content);
    },
    onSuccess: () => {
      toast.success("Journal entry saved");
      queryClient.invalidateQueries({ queryKey: ["wellness-stats"] });
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: () => {
      toast.error("Failed to save journal entry");
    },
  });
};

export const useUpdateJournalEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ entryId, content }: 
      { entryId: string, content: string }) => {
      return updateJournalEntry(entryId, content);
    },
    onSuccess: () => {
      toast.success("Journal entry updated");
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: () => {
      toast.error("Failed to update journal entry");
    },
  });
};

export const useUpdateWellnessGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (weeklyMinutesGoal: number) => {
      return updateWellnessGoal(weeklyMinutesGoal);
    },
    onSuccess: () => {
      toast.success("Wellness goal updated");
      queryClient.invalidateQueries({ queryKey: ["wellness-stats"] });
    },
    onError: () => {
      toast.error("Failed to update wellness goal");
    },
  });
};
