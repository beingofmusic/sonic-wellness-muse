
import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useLesson, useMarkLessonCompleted } from "@/hooks/useCourses";
import VideoPlayer from "@/components/course/VideoPlayer";
import PdfViewer from "@/components/course/PdfViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Loader2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LessonViewer: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { data: lesson, isLoading, error } = useLesson(lessonId || "");
  const markCompleted = useMarkLessonCompleted();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle marking the lesson as completed
  const handleMarkCompleted = async () => {
    if (!lessonId) return;
    
    console.log("Marking lesson as completed:", lessonId);
    
    markCompleted.mutate(lessonId, {
      onSuccess: () => {
        console.log("Lesson marked as completed successfully");
        toast({
          title: "Lesson completed!",
          description: "Your progress has been updated.",
        });
        // Note: Navigation to course page is now handled in the mutation hook
      },
      onError: (error) => {
        console.error("Error marking lesson as completed:", error);
        toast({
          title: "Error",
          description: "Failed to mark lesson as completed. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  // Handle manual return to course
  const handleReturnToCourse = () => {
    navigate(`/courses/${courseId}`);
  };

  // Debug output for the lesson data
  useEffect(() => {
    if (lesson) {
      console.log("Current lesson data:", lesson);
    }
  }, [lesson]);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse h-6 w-1/4 bg-white/10 rounded mb-8"></div>
          <div className="animate-pulse aspect-video w-full bg-white/10 rounded mb-6"></div>
          <div className="animate-pulse h-8 w-1/3 bg-white/10 rounded mb-4"></div>
          <div className="animate-pulse h-28 w-full bg-white/10 rounded mb-6"></div>
        </div>
      </Layout>
    );
  }

  if (error || !lesson) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="p-6 md:p-8 rounded-xl border border-white/10 bg-card/50 text-center">
            <h2 className="text-xl font-semibold mb-2">Lesson Not Found</h2>
            <p className="text-white/70 mb-4">
              The lesson you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              to={`/courses${courseId ? `/${courseId}` : ''}`}
              className="text-music-primary hover:text-music-primary/80 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {courseId ? 'Back to Course' : 'Back to Courses'}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Link 
          to={`/courses/${courseId}`}
          className="text-white/70 hover:text-white flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>

        <div className="mb-8">
          <VideoPlayer url={lesson.video_url} title={lesson.title} />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-4">{lesson.title}</h1>
        
        <div className="bg-card/30 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <BookOpen className="h-5 w-5 mt-0.5 flex-shrink-0 text-music-primary" />
            <div className="prose prose-invert max-w-none">
              <p>{lesson.summary}</p>
            </div>
          </div>
        </div>

        {lesson.pdf_url && (
          <div className="mb-8">
            <PdfViewer url={lesson.pdf_url} title={lesson.title} />
          </div>
        )}

        <div className="flex justify-between items-center border-t border-white/10 pt-6 mt-6">
          {!lesson.completed ? (
            <Button 
              onClick={handleMarkCompleted}
              disabled={markCompleted.isPending}
              className="flex items-center gap-2"
            >
              {markCompleted.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Mark as Completed
                </>
              )}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              disabled 
              className="flex items-center gap-2 bg-green-500/20 border-green-500/30 text-green-500"
            >
              <Check className="h-4 w-4" />
              Completed
            </Button>
          )}

          <Button variant="outline" onClick={handleReturnToCourse}>
            Return to Course
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default LessonViewer;
