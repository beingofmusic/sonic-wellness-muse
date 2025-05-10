
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WellnessStats, WellnessPractice, JournalPrompt } from "@/types/wellness";
import { 
  fetchWellnessStats, 
  fetchWellnessPractices, 
  fetchJournalPrompts, 
  saveJournalEntry,
  updateWellnessGoal,
  saveWellnessSession
} from "@/services/wellnessService";
import { checkForNewBadges } from "@/services/courseService";
import { useBadgeNotificationContext } from "@/context/BadgeNotificationContext";

// Hook to fetch wellness stats
export const useWellnessStats = () => {
  return useQuery({
    queryKey: ["wellness-stats"],
    queryFn: fetchWellnessStats
  });
};

// Hook to fetch wellness practices
export const useWellnessPractices = (type?: string) => {
  return useQuery({
    queryKey: ["wellness-practices", type],
    queryFn: () => fetchWellnessPractices(type)
  });
};

// Hook to fetch journal prompts
export const useJournalPrompts = (type?: string) => {
  return useQuery({
    queryKey: ["journal-prompts", type],
    queryFn: () => fetchJournalPrompts(type)
  });
};

// Hook to save journal entries
export const useSaveJournalEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ promptId, content }: { promptId: string | null, content: string }) => {
      return saveJournalEntry(promptId || null, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["wellness-stats"] });
    },
    onError: (error) => {
      console.error("Error saving journal entry:", error);
      toast.error("Failed to save journal entry");
    }
  });
};

// Hook to update wellness goal
export const useUpdateWellnessGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (weeklyMinutesGoal: number) => {
      return updateWellnessGoal(weeklyMinutesGoal);
    },
    onSuccess: () => {
      toast.success("Wellness goal updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["wellness-stats"] });
    },
    onError: (error) => {
      console.error("Error updating wellness goal:", error);
      toast.error("Failed to update goal");
    }
  });
};

// Hook to complete wellness sessions
export const useCompleteWellnessSession = () => {
  const queryClient = useQueryClient();
  const { showBadgeNotification } = useBadgeNotificationContext();
  
  return useMutation({
    mutationFn: async (params: { practiceId: string, durationMinutes: number }) => {
      const { practiceId, durationMinutes } = params;

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("User not authenticated");
      }

      // Log wellness session completion
      const success = await saveWellnessSession(practiceId, durationMinutes);
      if (!success) {
        throw new Error("Failed to save wellness session");
      }

      // Check for new badges
      const newBadges = await checkForNewBadges(userData.user.id);
      
      return { success: true, newBadges };
    },
    onSuccess: (data) => {
      // Show success message
      toast.success("Wellness practice completed!");
      
      // Show badge notification if a new badge was earned
      if (data.newBadges && data.newBadges.length > 0) {
        showBadgeNotification(data.newBadges[0]);
      }
      
      // Invalidate wellness stats query to refresh data
      queryClient.invalidateQueries({ queryKey: ["wellness-stats"] });
      
      // Invalidate recent completions
      queryClient.invalidateQueries({ queryKey: ["wellness-recent"] });
    },
    onError: (error) => {
      console.error("Failed to complete wellness session:", error);
      toast.error("Failed to save your progress");
    }
  });
};
