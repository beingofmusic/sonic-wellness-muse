
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PracticeRoutine } from "@/types/practice";

/**
 * Hook to fetch the user's practice routines
 * @returns Query result with the user's practice routines and their calculated durations
 */
export const useUserRoutines = (limit?: number) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-routines", limit],
    queryFn: async (): Promise<PracticeRoutine[]> => {
      if (!user) return [];
      
      try {
        // Fetch user's routines
        const { data: routines, error: routinesError } = await supabase
          .from("routines")
          .select("*")
          .eq("created_by", user.id)
          .eq("is_template", false)
          .order("updated_at", { ascending: false })
          .limit(limit || 10);

        if (routinesError) throw routinesError;
        
        if (!routines?.length) return [];
        
        // For each routine, calculate the total duration from its blocks
        const routinesWithDuration = await Promise.all(
          routines.map(async (routine) => {
            // Fetch blocks for this routine
            const { data: blocks, error: blocksError } = await supabase
              .from("routine_blocks")
              .select("duration")
              .eq("routine_id", routine.id);
              
            if (blocksError) {
              console.error(`Error fetching blocks for routine ${routine.id}:`, blocksError);
              return { ...routine, progress: 0 };
            }
            
            // Calculate total duration
            const totalDuration = blocks?.reduce((sum, block) => sum + (block.duration || 0), 0) || 0;
            
            // Add a random progress value for now (can be replaced with actual progress tracking later)
            const progress = Math.floor(Math.random() * 50); // Random progress between 0-50%
            
            return {
              ...routine,
              duration: totalDuration,
              progress
            };
          })
        );
        
        return routinesWithDuration;
      } catch (error) {
        console.error("Error fetching user routines:", error);
        return [];
      }
    },
    enabled: !!user,
  });
};
