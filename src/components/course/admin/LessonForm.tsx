
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lesson } from "@/types/course";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateLesson, useUpdateLesson } from "@/hooks/useCourseAdmin";
import { X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LessonFormProps {
  courseId: string;
  lesson?: Lesson;
  nextOrderIndex?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  video_url: z.string().min(1, "Video URL is required"),
  pdf_url: z.string().optional().nullable(),
  summary: z.string().min(1, "Summary is required"),
  order_index: z.coerce.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

const LessonForm: React.FC<LessonFormProps> = ({ 
  courseId, 
  lesson, 
  nextOrderIndex = 1, 
  onClose, 
  onSuccess 
}) => {
  const isEditing = !!lesson;
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const { toast } = useToast();

  const defaultValues: FormValues = {
    title: lesson?.title || "",
    video_url: lesson?.video_url || "",
    pdf_url: lesson?.pdf_url || "",
    summary: lesson?.summary || "",
    order_index: lesson?.order_index || nextOrderIndex,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    try {
      console.log("Submitting lesson form with data:", data);
      
      const lessonData = {
        title: data.title, // Ensure title is included and not optional
        video_url: data.video_url, // Ensure video_url is included and not optional
        summary: data.summary, // Ensure summary is included and not optional
        order_index: data.order_index, // Ensure order_index is included and not optional
        pdf_url: data.pdf_url || null,
        course_id: courseId,
      };

      console.log("Processing lesson data:", lessonData);

      if (isEditing && lesson) {
        await updateLesson.mutateAsync({
          id: lesson.id,
          ...lessonData,
        });
        toast({
          title: "Lesson Updated",
          description: "The lesson has been updated successfully.",
        });
      } else {
        console.log("Creating new lesson...");
        await createLesson.mutateAsync(lessonData);
        toast({
          title: "Lesson Created",
          description: "The lesson has been created successfully.",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} lesson. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const isSubmitting = createLesson.isPending || updateLesson.isPending;
  const error = createLesson.error || updateLesson.error;

  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const formatYouTubeUrl = (url: string): string => {
    // Already an embed URL
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Regular YouTube URL
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[7].length === 11 ? match[7] : null;
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url;
  };

  const videoUrl = form.watch("video_url");
  const formattedVideoUrl = videoUrl && isYouTubeUrl(videoUrl) ? formatYouTubeUrl(videoUrl) : videoUrl;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error: {error instanceof Error ? error.message : "Unknown error occurred"}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Lesson title" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="YouTube or direct video URL" 
                      {...field} 
                      disabled={isSubmitting}
                      onChange={(e) => {
                        field.onChange(e);
                        form.trigger("video_url");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {videoUrl && !form.formState.errors.video_url && (
                    <div className="mt-2 aspect-video w-full rounded-md overflow-hidden bg-black">
                      {isYouTubeUrl(videoUrl) ? (
                        <iframe
                          src={formattedVideoUrl}
                          title="Video preview"
                          className="w-full h-full"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <video src={videoUrl} controls className="w-full h-full">
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pdf_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PDF URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="URL to PDF resource" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Lesson summary or description"
                      className="min-h-32"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order_index"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Lesson order (1, 2, 3...)"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Adding Lesson"}
                  </>
                ) : (
                  isEditing ? "Update Lesson" : "Add Lesson"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LessonForm;
