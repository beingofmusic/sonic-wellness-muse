
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = "bg-music-primary",
  isLoading = false
}) => {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60 mb-1">{title}</p>
            {isLoading ? (
              <div className="h-7 w-20 bg-white/10 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">{value}</p>
            )}
          </div>
          
          <div className={`${color}/20 p-3 rounded-full`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
