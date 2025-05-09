
import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lesson } from "@/types/course";
import { Badge } from "@/components/ui/badge";

interface LessonItemProps {
  lesson: Lesson;
  courseId: string;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, courseId }) => {
  return (
    <Link 
      to={`/courses/${courseId}/lessons/${lesson.id}`}
      className={cn(
        "flex items-center p-3 rounded-lg border mb-2 gap-3 hover:bg-white/5 transition-colors",
        lesson.completed ? "border-green-500/30 bg-green-500/5" : "border-white/10"
      )}
      aria-label={`${lesson.title} - ${lesson.completed ? 'Completed' : 'Not started'}`}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center",
        lesson.completed ? "bg-green-500/20" : "bg-white/10"
      )}>
        {lesson.completed ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <span className="text-sm">{lesson.order_index}</span>
        )}
      </div>
      
      <div className="flex-1">
        <h4 className="font-medium">{lesson.title}</h4>
      </div>
      
      {lesson.completed ? (
        <Badge variant="success">Completed</Badge>
      ) : (
        <Badge variant="outline" className="bg-white/5">Not Started</Badge>
      )}
    </Link>
  );
};

export default LessonItem;

// Add this Badge component variant for the "success" type
interface BadgeProps {
  variant?: "outline" | "success";
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant = "outline", children, className }) => {
  return (
    <span className={cn(
      "px-2 py-0.5 text-xs rounded-full",
      variant === "outline" ? "border border-white/10" : "",
      variant === "success" ? "bg-green-500/20 text-green-500" : "",
      className
    )}>
      {children}
    </span>
  );
};
