
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
      const { data, error } = await supabase
        .from("courses")
        .insert(courseData)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

// Update an existing course
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateCourseData) => {
      const { data, error } = await supabase
        .from("courses")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", data.id] });
    },
  });
};

// Delete a course
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", courseId);
      if (error) throw error;
      return courseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

// Create a new lesson
export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lessonData: CreateLessonData) => {
      const { data, error } = await supabase
        .from("lessons")
        .insert(lessonData)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["course-lessons", data.course_id] });
      queryClient.invalidateQueries({ queryKey: ["courses"] }); // To refresh lesson count
    },
  });
};

// Update an existing lesson
export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateLessonData) => {
      const { data, error } = await supabase
        .from("lessons")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["course-lessons", data.course_id] });
      queryClient.invalidateQueries({ queryKey: ["lesson", data.id] });
    },
  });
};

// Delete a lesson
export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: string) => {
      // First get the lesson to know the course_id
      const { data: lesson } = await supabase
        .from("lessons")
        .select("course_id")
        .eq("id", lessonId)
        .single();
      
      const courseId = lesson?.course_id;
      
      // Delete the lesson
      const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
      if (error) throw error;
      
      return { lessonId, courseId };
    },
    onSuccess: ({ courseId }) => {
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ["course-lessons", courseId] });
        queryClient.invalidateQueries({ queryKey: ["courses"] }); // To refresh lesson count
      }
    },
  });
};

// Update lesson order
export const useUpdateLessonOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: OrderUpdateData[]) => {
      // Get the first lesson to find the course_id for cache invalidation
      const { data: lesson } = await supabase
        .from("lessons")
        .select("course_id")
        .eq("id", updates[0].id)
        .single();
      
      const courseId = lesson?.course_id;
      
      // Update each lesson order in sequence
      for (const update of updates) {
        const { error } = await supabase
          .from("lessons")
          .update({ order_index: update.order_index })
          .eq("id", update.id);
        
        if (error) throw error;
      }
      
      return courseId;
    },
    onSuccess: (courseId) => {
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ["course-lessons", courseId] });
      }
    },
  });
};
