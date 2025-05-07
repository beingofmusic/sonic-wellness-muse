
import React from "react";

interface CourseProgressCardProps {
  title: string;
  progress: number;
  color?: string;
}

const CourseProgressCard: React.FC<CourseProgressCardProps> = ({ 
  title, 
  progress, 
  color = "bg-music-primary" 
}) => {
  return (
    <div className="p-4 rounded-lg hover:bg-white/5 transition-all">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">{title}</h4>
        <span className="text-xs text-white/70">{progress}% Complete</span>
      </div>
      <div className="progress-bar">
        <div 
          className={`progress-value ${color}`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default CourseProgressCard;
