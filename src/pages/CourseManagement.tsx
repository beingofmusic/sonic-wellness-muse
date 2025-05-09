
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCourses } from "@/hooks/useCourses";
import CourseManagementList from "@/components/course/admin/CourseManagementList";
import CourseForm from "@/components/course/admin/CourseForm";
import { useToast } from "@/hooks/use-toast";
import PermissionRoute from "@/components/PermissionRoute";
import { useNavigate } from "react-router-dom";

const CourseManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const { data: courses = [], isLoading, error, refetch } = useCourses();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Effect to refetch courses when the component mounts or the user changes
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.tags && course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Handle successful course creation
  const handleCourseCreated = () => {
    setIsAddingCourse(false);
    refetch();
    toast({
      title: "Course Created",
      description: "The course has been created successfully.",
    });
  };

  return (
    <Layout>
      <PermissionRoute permission="manage_courses">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Course Management</h1>
            <Button 
              onClick={() => setIsAddingCourse(true)} 
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Course
            </Button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
            <Input
              placeholder="Search courses by title, instructor, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-20 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center rounded-lg border border-white/10 bg-card/30">
              <h3 className="text-lg font-medium mb-2">Error Loading Courses</h3>
              <p className="text-white/70">
                {error instanceof Error ? error.message : "There was a problem loading the course data."}
              </p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-6 text-center rounded-lg border border-white/10 bg-card/30">
              <h3 className="text-lg font-medium mb-2">No Courses Found</h3>
              <p className="text-white/70">
                {searchQuery ? "No courses match your search criteria." : "There are no courses yet. Create your first course!"}
              </p>
            </div>
          ) : (
            <CourseManagementList courses={filteredCourses} />
          )}

          {isAddingCourse && (
            <CourseForm
              onClose={() => setIsAddingCourse(false)}
              onSuccess={handleCourseCreated}
            />
          )}
        </div>
      </PermissionRoute>
    </Layout>
  );
};

export default CourseManagement;
