
import React from "react";
import { Layout } from "@/components/Layout";
import { useCourses } from "@/hooks/useCourses";
import CourseCard from "@/components/course/CourseCard";
import { BookOpen, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Courses: React.FC = () => {
  const { data: courses = [], isLoading, error } = useCourses();
  const { hasPermission } = useAuth();
  const canManageCourses = hasPermission("manage_courses");

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Courses</h1>
          {canManageCourses && (
            <Link to="/courses/manage">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manage Courses
              </Button>
            </Link>
          )}
        </div>
        
        <p className="text-white/70 mb-8">
          Browse and access educational courses to enhance your musical skills.
        </p>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-[350px] rounded-xl border border-white/10 bg-card/30 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 md:p-8 rounded-xl border border-white/10 bg-card/50 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Courses</h2>
            <p className="text-white/70">
              There was an issue loading the courses. Please try again later.
            </p>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-6 md:p-8 rounded-xl border border-white/10 bg-card/50 text-center">
            <h2 className="text-xl font-semibold mb-2">No Courses Available</h2>
            <p className="text-white/70">
              No courses are currently available. Check back soon for new learning opportunities!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Courses;
