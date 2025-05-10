
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkForNewBadges } from "@/services/courseService";
import { useBadgeNotificationContext } from "@/context/BadgeNotificationContext";

interface CompleteWellnessSessionParams {
  practiceId: string;
  durationMinutes: number;
}

export const useCompleteWellnessSession = () => {
  const queryClient = useQueryClient();
  const { showBadgeNotification } = useBadgeNotificationContext();
  
  return useMutation({
    mutationFn: async (params: CompleteWellnessSessionParams) => {
      const { practiceId, durationMinutes } = params;

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("User not authenticated");
      }

      // Log wellness session completion
      const { error } = await supabase
        .from("wellness_completions")
        .insert({
          practice_id: practiceId,
          user_id: userData.user.id,
          duration_minutes: durationMinutes
        });

      if (error) {
        console.error("Error completing wellness session:", error);
        throw error;
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
