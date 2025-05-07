
import React from "react";

interface ProgressCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color = "bg-music-primary"
}) => {
  return (
    <div className="dashboard-section">
      <div className="flex items-center gap-3 mb-2">
        <div className={`rounded-full ${color}/20 p-2 flex items-center justify-center`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-white/70">{title}</span>
          <span className="text-xl font-semibold">{value}</span>
          {subtitle && <span className="text-xs text-white/50">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
