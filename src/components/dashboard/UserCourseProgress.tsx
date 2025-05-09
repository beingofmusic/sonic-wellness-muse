
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserCourseProgress } from "@/hooks/useUserCourseProgress";
import CourseProgressCard from "@/components/CourseProgressCard";
import { Book } from "lucide-react";

const UserCourseProgress: React.FC = () => {
  const { data: courses = [], isLoading, error } = useUserCourseProgress();
  
  // We'll show up to 3 courses in progress
  const displayCourses = courses.slice(0, 3);
  
  // Get color for each course (cycling through a few options)
  const getColorForIndex = (index: number) => {
    const colors = ["bg-music-primary", "bg-music-secondary", "bg-music-tertiary"];
    return colors[index % colors.length];
  };
  
  return (
    <section className="mb-8">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Course Progress</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">Your Courses in Progress</span>
          <Link to="/courses" className="text-sm text-white/70 hover:text-white transition-colors">
            All Courses
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 h-36 flex items-center justify-center">
            <div className="animate-pulse text-white/50">Loading your courses...</div>
          </div>
        ) : error ? (
          <div className="col-span-3 h-36 flex items-center justify-center">
            <div className="text-white/50">Could not load your course progress</div>
          </div>
        ) : displayCourses.length > 0 ? (
          // Show courses with their progress
          displayCourses.map((course, index) => (
            <Link to={`/courses/${course.id}`} key={course.id}>
              <CourseProgressCard
                title={course.title}
                progress={course.completion_percentage}
                color={getColorForIndex(index)}
              />
            </Link>
          ))
        ) : (
          // Empty state
          <div className="col-span-3 p-6 rounded-lg bg-white/5 flex flex-col items-center justify-center h-36">
            <Book className="h-10 w-10 text-white/30 mb-2" />
            <p className="text-center text-white/70">Start a course to track your progress here.</p>
            <Link to="/courses">
              <Button 
                variant="outline" 
                className="mt-4 text-sm bg-transparent border border-music-primary/30 text-music-primary hover:bg-music-primary/10"
              >
                Browse Courses
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default UserCourseProgress;
