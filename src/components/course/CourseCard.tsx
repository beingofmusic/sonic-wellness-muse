
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, GraduationCap } from "lucide-react";
import { CourseWithProgress } from "@/types/course";

interface CourseCardProps {
  course: CourseWithProgress;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const {
    id,
    title,
    description,
    instructor,
    thumbnail_url,
    tags,
    completion_percentage,
    total_lessons,
    completed_lessons
  } = course;

  return (
    <Link to={`/courses/${id}`}>
      <Card className="h-full overflow-hidden hover:border-music-primary transition-colors cursor-pointer bg-card/50 backdrop-blur-sm border-white/10">
        {thumbnail_url && (
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={thumbnail_url} 
              alt={title} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
        )}
        
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-1">{title}</h3>
          <div className="flex items-center text-sm text-white/70 gap-1 mb-2">
            <GraduationCap className="h-4 w-4" />
            <span>{instructor}</span>
          </div>
          <p className="text-sm text-white/70 line-clamp-2 mb-3">{description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags?.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline"
                className="bg-white/5 text-white/70 hover:bg-white/10"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-white/70 mb-1">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{completed_lessons} / {total_lessons} lessons</span>
              </div>
              <span>{completion_percentage}% Complete</span>
            </div>
            <Progress value={completion_percentage} className="h-2" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CourseCard;
