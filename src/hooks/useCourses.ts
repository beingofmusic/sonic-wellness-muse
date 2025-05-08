
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchCoursesWithProgress, 
  fetchCourseById,
  fetchLessonsForCourse, 
  fetchLessonById,
  markLessonAsCompleted 
} from "@/services/courseService";

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
  
  return useMutation({
    mutationFn: markLessonAsCompleted,
    onSuccess: (_, lessonId) => {
      // Get the lesson details to find its course_id
      queryClient.fetchQuery({
        queryKey: ["lesson", lessonId],
        queryFn: () => fetchLessonById(lessonId)
      }).then(lesson => {
        if (lesson) {
          // Invalidate the course's lessons to refresh completion status
          queryClient.invalidateQueries({ queryKey: ["course-lessons", lesson.course_id] });
          // Invalidate the courses list to refresh progress bars
          queryClient.invalidateQueries({ queryKey: ["courses"] });
          // Invalidate the specific lesson query to refresh its completion status
          queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
        }
      });
    }
  });
};
