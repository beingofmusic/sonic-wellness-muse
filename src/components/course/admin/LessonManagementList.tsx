
import React, { useState } from "react";
import { useCourseLessons } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUp, ArrowDown, Edit, Trash2 } from "lucide-react";
import LessonForm from "./LessonForm";
import { useDeleteLesson, useUpdateLessonOrder } from "@/hooks/useCourseAdmin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Lesson } from "@/types/course";

interface LessonManagementListProps {
  courseId: string;
}

const LessonManagementList: React.FC<LessonManagementListProps> = ({ courseId }) => {
  const { data: lessons = [], isLoading } = useCourseLessons(courseId);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const deleteLesson = useDeleteLesson();
  const updateLessonOrder = useUpdateLessonOrder();
  const { toast } = useToast();

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;
    
    try {
      await deleteLesson.mutateAsync(lessonToDelete.id);
      toast({
        title: "Lesson Deleted",
        description: `"${lessonToDelete.title}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the lesson. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLessonToDelete(null);
    }
  };

  const handleMoveLesson = async (lessonId: string, direction: "up" | "down") => {
    const sortedLessons = [...lessons].sort((a, b) => a.order_index - b.order_index);
    const currentIndex = sortedLessons.findIndex(lesson => lesson.id === lessonId);
    
    if (
      (direction === "up" && currentIndex === 0) || 
      (direction === "down" && currentIndex === sortedLessons.length - 1)
    ) {
      return;
    }
    
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const targetLesson = sortedLessons[targetIndex];
    const currentLesson = sortedLessons[currentIndex];
    
    try {
      await updateLessonOrder.mutateAsync([
        { 
          id: targetLesson.id, 
          order_index: currentLesson.order_index 
        },
        { 
          id: currentLesson.id, 
          order_index: targetLesson.order_index 
        }
      ]);
      
      toast({
        title: "Order Updated",
        description: "Lesson order has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lesson order. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Sort lessons by order_index
  const sortedLessons = [...lessons].sort((a, b) => a.order_index - b.order_index);

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-white/5 rounded-lg"></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Course Lessons</h3>
        <Button onClick={() => setIsAddingLesson(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Lesson
        </Button>
      </div>

      {sortedLessons.length === 0 ? (
        <div className="p-6 text-center rounded-lg border border-white/10 bg-card/30">
          <p className="text-white/70">No lessons yet. Add your first lesson!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-card/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10">
                  {lesson.order_index}
                </div>
                <div>
                  <h4 className="font-medium">{lesson.title}</h4>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoveLesson(lesson.id, "up")}
                  disabled={lesson.order_index === sortedLessons[0].order_index}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoveLesson(lesson.id, "down")}
                  disabled={
                    lesson.order_index === 
                    sortedLessons[sortedLessons.length - 1].order_index
                  }
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingLesson(lesson)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLessonToDelete(lesson)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddingLesson && (
        <LessonForm
          courseId={courseId}
          nextOrderIndex={sortedLessons.length > 0 ? Math.max(...sortedLessons.map(l => l.order_index)) + 1 : 1}
          onClose={() => setIsAddingLesson(false)}
          onSuccess={() => {
            setIsAddingLesson(false);
            toast({
              title: "Lesson Added",
              description: "The lesson has been added successfully.",
            });
          }}
        />
      )}

      {editingLesson && (
        <LessonForm
          courseId={courseId}
          lesson={editingLesson}
          onClose={() => setEditingLesson(null)}
          onSuccess={() => {
            setEditingLesson(null);
            toast({
              title: "Lesson Updated",
              description: "The lesson has been updated successfully.",
            });
          }}
        />
      )}

      <AlertDialog open={!!lessonToDelete} onOpenChange={(open) => !open && setLessonToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{lessonToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LessonManagementList;
