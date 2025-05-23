
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { CourseWithProgress } from "@/types/course";

/**
 * Hook to fetch the user's course progress data
 * @returns Query result with the user's in-progress courses
 */
export const useUserCourseProgress = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-course-progress"],
    queryFn: async (): Promise<CourseWithProgress[]> => {
      if (!user) return [];
      
      try {
        // Use our custom SQL function to fetch courses with progress data
        const { data, error } = await supabase
          .rpc('get_user_courses_with_progress', { 
            user_uuid: user.id 
          });

        if (error) throw error;
        
        // The function returns data in the format we need
        return data || [];
      } catch (error) {
        console.error("Error fetching user course progress:", error);
        return [];
      }
    },
    enabled: !!user,
  });
};
