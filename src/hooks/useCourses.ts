import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchCoursesWithProgress, 
  fetchCourseById,
  fetchLessonsForCourse, 
  fetchLessonById,
  markLessonAsCompleted,
  checkForNewBadges
} from "@/services/courseService";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useBadgeNotificationContext } from "@/context/BadgeNotificationContext";
import { Badge } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: fetchCoursesWithProgress,
  });
};

export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourseById(courseId),
    enabled: !!courseId,
  });
};

export const useCourseLessons = (courseId: string) => {
  return useQuery({
    queryKey: ["course-lessons", courseId],
    queryFn: () => fetchLessonsForCourse(courseId),
    enabled: !!courseId,
  });
};

export const useLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => fetchLessonById(lessonId),
    enabled: !!lessonId,
  });
};

export const useMarkLessonCompleted = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showBadgeNotification } = useBadgeNotificationContext();
  
  return useMutation({
    mutationFn: async (lessonId: string) => {
      console.log("Starting mutation to mark lesson completed:", lessonId);
      await markLessonAsCompleted(lessonId);
      
      // Get the user's ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      // Check for any new badges that were just earned
      const newBadges = await checkForNewBadges(session.user.id);
      
      // Return the first new badge (if any) to be shown in the notification
      return newBadges.length > 0 ? newBadges[0] : null;
    },
    onSuccess: async (newBadge: Badge | null, lessonId) => {
      console.log("Mutation successful, now invalidating queries");
      
      // First get the lesson details to find its course_id
      queryClient.fetchQuery({
        queryKey: ["lesson", lessonId],
        queryFn: () => fetchLessonById(lessonId)
      }).then(lesson => {
        if (lesson) {
          console.log("Lesson fetched for invalidation:", lesson);
          const courseId = lesson.course_id;
          
          // Show success toast
          toast({
            title: "Lesson completed!",
            description: "Your progress has been updated.",
            duration: 3000,
          });
          
          // Display badge notification if a new badge was earned
          if (newBadge) {
            showBadgeNotification(newBadge);
          }
          
          // Invalidate the course's lessons to refresh completion status
          queryClient.invalidateQueries({ 
            queryKey: ["course-lessons", courseId] 
          });
          
          // Invalidate the courses list to refresh progress bars
          queryClient.invalidateQueries({ 
            queryKey: ["courses"] 
          });
          
          // Invalidate user-course-progress if it exists
          queryClient.invalidateQueries({ 
            queryKey: ["user-course-progress"] 
          });
          
          // Invalidate the specific lesson query to refresh its completion status
          queryClient.invalidateQueries({ 
            queryKey: ["lesson", lessonId] 
          });
          
          // Navigate back to the course page
          navigate(`/courses/${courseId}`);
        }
      });
    },
    onError: (error) => {
      console.error("Error in mark lesson completed mutation:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to mark lesson as completed. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  });
};
