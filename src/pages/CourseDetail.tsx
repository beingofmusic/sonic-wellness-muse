
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useCourse, useCourseLessons } from "@/hooks/useCourses";
import LessonItem from "@/components/course/LessonItem";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, isLoading: courseLoading } = useCourse(courseId || "");
  const { data: lessons = [], isLoading: lessonsLoading } = useCourseLessons(courseId || "");

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const completionPercentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;

  if (courseLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse h-10 w-3/4 bg-white/10 rounded mb-6"></div>
          <div className="animate-pulse h-6 w-1/2 bg-white/10 rounded mb-8"></div>
          <div className="animate-pulse h-40 w-full bg-white/10 rounded mb-6"></div>
          <div className="animate-pulse h-16 w-full bg-white/10 rounded mb-4"></div>
          <div className="animate-pulse h-16 w-full bg-white/10 rounded mb-4"></div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="p-6 md:p-8 rounded-xl border border-white/10 bg-card/50 text-center">
            <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
            <p className="text-white/70 mb-4">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              to="/courses"
              className="text-music-primary hover:text-music-primary/80 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
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
          to="/courses"
          className="text-white/70 hover:text-white flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Courses
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.title}</h1>
        
        <div className="flex items-center text-sm text-white/70 gap-1 mb-4">
          <GraduationCap className="h-4 w-4" />
          <span>Instructor: {course.instructor}</span>
        </div>

        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {course.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline"
                className="bg-white/5 text-white/70 hover:bg-white/10"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="mb-8">
          <p className="text-white/70 mb-6">{course.description}</p>
          
          <div className="border border-white/10 rounded-lg p-4 bg-card/30">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Course Progress</span>
              </div>
              <span className="text-sm text-white/70">{completedLessons} of {totalLessons} lessons completed</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Lessons</h2>
        
        {lessonsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-16 rounded border border-white/10 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="p-6 rounded-lg border border-white/10 bg-card/30 text-center">
            <p className="text-white/70">No lessons available for this course yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <LessonItem 
                key={lesson.id} 
                lesson={lesson} 
                courseId={course.id} 
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CourseDetail;
