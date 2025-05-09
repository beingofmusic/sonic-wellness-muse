
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Course, Lesson } from "@/types/course";
import { supabase } from "@/integrations/supabase/client";

// Types for creating/updating courses and lessons
type CreateCourseData = Omit<Course, "id" | "created_at">;
type UpdateCourseData = Partial<Course> & { id: string };
type CreateLessonData = Omit<Lesson, "id" | "created_at" | "completed">;
type UpdateLessonData = Partial<Lesson> & { id: string };
type OrderUpdateData = { id: string; order_index: number };

// Create a new course
export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseData: CreateCourseData) => {
      console.log("Creating course with data:", courseData);
      
      // Check required fields
      if (!courseData.title || !courseData.description || !courseData.instructor) {
        console.error("Missing required fields:", courseData);
        throw new Error("Missing required fields for course creation");
      }
      
      const { data, error } = await supabase
        .from("courses")
        .insert(courseData)
        .select("*")
        .single();

      if (error) {
        console.error("Error creating course:", error);
        throw error;
      }
      
      console.log("Course created successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => {
      console.error("Course creation error:", error);
    },
  });
};

// Update an existing course
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateCourseData) => {
      console.log("Updating course with ID:", id, "Updates:", updates);
      
      const { data, error } = await supabase
        .from("courses")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating course:", error);
        throw error;
      }
      
      console.log("Course updated successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", data.id] });
    },
    onError: (error) => {
      console.error("Course update error:", error);
    },
  });
};

// Delete a course
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      console.log("Deleting course with ID:", courseId);
      
      // First delete all lessons for this course
      const { error: lessonsError } = await supabase
        .from("lessons")
        .delete()
        .eq("course_id", courseId);
        
      if (lessonsError) {
        console.error("Error deleting course lessons:", lessonsError);
        throw lessonsError;
      }
      
      // Then delete the course
      const { error } = await supabase.from("courses").delete().eq("id", courseId);
      if (error) {
        console.error("Error deleting course:", error);
        throw error;
      }
      
      console.log("Course and its lessons deleted successfully");
      return courseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => {
      console.error("Course deletion error:", error);
    },
  });
};

// Create a new lesson
export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lessonData: CreateLessonData) => {
      console.log("Creating lesson with data:", lessonData);
      
      // Check required fields
      if (!lessonData.title || !lessonData.video_url || !lessonData.summary || !lessonData.course_id) {
        console.error("Missing required fields:", lessonData);
        throw new Error("Missing required fields for lesson creation");
      }
      
      const { data, error } = await supabase
        .from("lessons")
        .insert(lessonData)
        .select("*")
        .single();

      if (error) {
        console.error("Error creating lesson:", error);
        throw error;
      }
      
      console.log("Lesson created successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["course-lessons", data.course_id] });
      queryClient.invalidateQueries({ queryKey: ["courses"] }); // To refresh lesson count
    },
    onError: (error) => {
      console.error("Lesson creation error:", error);
    },
  });
};

// Update an existing lesson
export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateLessonData) => {
      console.log("Updating lesson with ID:", id, "Updates:", updates);
      
      const { data, error } = await supabase
        .from("lessons")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating lesson:", error);
        throw error;
      }
      
      console.log("Lesson updated successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["course-lessons", data.course_id] });
      queryClient.invalidateQueries({ queryKey: ["lesson", data.id] });
    },
    onError: (error) => {
      console.error("Lesson update error:", error);
    },
  });
};

// Delete a lesson
export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: string) => {
      console.log("Deleting lesson with ID:", lessonId);
      
      // First get the lesson to know the course_id
      const { data: lesson, error: fetchError } = await supabase
        .from("lessons")
        .select("course_id")
        .eq("id", lessonId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching lesson before deletion:", fetchError);
        throw fetchError;
      }
      
      const courseId = lesson?.course_id;
      
      // Delete the lesson
      const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
      if (error) {
        console.error("Error deleting lesson:", error);
        throw error;
      }
      
      console.log("Lesson deleted successfully");
      return { lessonId, courseId };
    },
    onSuccess: ({ courseId }) => {
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ["course-lessons", courseId] });
        queryClient.invalidateQueries({ queryKey: ["courses"] }); // To refresh lesson count
      }
    },
    onError: (error) => {
      console.error("Lesson deletion error:", error);
    },
  });
};

// Update lesson order
export const useUpdateLessonOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: OrderUpdateData[]) => {
      console.log("Updating lesson order:", updates);
      
      if (updates.length === 0) {
        console.warn("No lesson updates provided");
        return null;
      }
      
      // Get the first lesson to find the course_id for cache invalidation
      const { data: lesson, error: fetchError } = await supabase
        .from("lessons")
        .select("course_id")
        .eq("id", updates[0].id)
        .single();
      
      if (fetchError) {
        console.error("Error fetching lesson for order update:", fetchError);
        throw fetchError;
      }
      
      const courseId = lesson?.course_id;
      
      // Update each lesson order in sequence
      for (const update of updates) {
        const { error } = await supabase
          .from("lessons")
          .update({ order_index: update.order_index })
          .eq("id", update.id);
        
        if (error) {
          console.error("Error updating lesson order:", error);
          throw error;
        }
      }
      
      console.log("Lesson order updated successfully");
      return courseId;
    },
    onSuccess: (courseId) => {
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ["course-lessons", courseId] });
      }
    },
    onError: (error) => {
      console.error("Lesson order update error:", error);
    },
  });
};
