
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  fetchJournalPrompts, 
  fetchJournalPromptById, 
  fetchUserJournalEntries,
  fetchJournalEntryByPromptId,
  saveJournalEntry,
  fetchJournalSectionProgress
} from "@/services/journalService";
import { JournalSectionType } from "@/types/journal";
import { useEffect, useState } from "react";

export const useJournalPrompts = (section?: JournalSectionType) => {
  return useQuery({
    queryKey: ['journal-prompts', section],
    queryFn: () => fetchJournalPrompts(section),
  });
};

export const useJournalPrompt = (promptId: string | undefined) => {
  return useQuery({
    queryKey: ['journal-prompt', promptId],
    queryFn: () => fetchJournalPromptById(promptId || ''),
    enabled: !!promptId,
  });
};

export const useJournalEntries = () => {
  return useQuery({
    queryKey: ['journal-entries'],
    queryFn: fetchUserJournalEntries,
  });
};

export const useJournalEntry = (promptId: string | undefined) => {
  return useQuery({
    queryKey: ['journal-entry', promptId],
    queryFn: () => fetchJournalEntryByPromptId(promptId || ''),
    enabled: !!promptId,
  });
};

export const useSaveJournalEntry = () => {
  return useMutation({
    mutationFn: ({ 
      promptId, 
      content, 
      isCompleted = false 
    }: { 
      promptId: string, 
      content: string, 
      isCompleted?: boolean 
    }) => saveJournalEntry(promptId, content, isCompleted),
    onSuccess: () => {
      // Note: Query invalidation is handled at the component level
    }
  });
};

export const useJournalProgress = (section?: JournalSectionType) => {
  return useQuery({
    queryKey: ['journal-progress', section],
    queryFn: () => fetchJournalSectionProgress(section),
  });
};

export const useJournalAutoSave = (
  promptId: string | undefined, 
  content: string, 
  autoSaveInterval = 30000
) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveEntry = useSaveJournalEntry();
  
  useEffect(() => {
    if (!promptId || content.trim().length < 10) return;
    
    const timer = setTimeout(() => {
      saveEntry.mutate(
        { promptId, content, isCompleted: false },
        { 
          onSuccess: () => {
            setLastSaved(new Date());
          }
        }
      );
    }, autoSaveInterval);
    
    return () => {
      clearTimeout(timer);
    };
  }, [promptId, content, autoSaveInterval, saveEntry]);
  
  return { lastSaved, isAutoSaving: saveEntry.isPending };
};
