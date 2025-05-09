
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchCoursesWithProgress, 
  fetchCourseById,
  fetchLessonsForCourse, 
  fetchLessonById,
  markLessonAsCompleted 
} from "@/services/courseService";
import { useNavigate } from "react-router-dom";

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
  
  return useMutation({
    mutationFn: (lessonId: string) => {
      console.log("Starting mutation to mark lesson completed:", lessonId);
      return markLessonAsCompleted(lessonId);
    },
    onSuccess: (_, lessonId) => {
      console.log("Mutation successful, now invalidating queries");
      
      // First get the lesson details to find its course_id
      queryClient.fetchQuery({
        queryKey: ["lesson", lessonId],
        queryFn: () => fetchLessonById(lessonId)
      }).then(lesson => {
        if (lesson) {
          console.log("Lesson fetched for invalidation:", lesson);
          const courseId = lesson.course_id;
          
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
    }
  });
};
