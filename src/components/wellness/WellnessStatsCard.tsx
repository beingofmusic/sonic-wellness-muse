
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Calendar, 
  Clock, 
  BookOpen, 
  Target
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WellnessStats } from '@/types/wellness';

interface WellnessStatsCardProps {
  stats: WellnessStats | null;
  isLoading: boolean;
}

const WellnessStatsCard: React.FC<WellnessStatsCardProps> = ({ 
  stats, 
  isLoading 
}) => {
  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!stats) return 0;
    
    // Calculate minutes practiced this week
    const minutesPracticed = stats.total_minutes;
    
    // Get weekly goal
    const weeklyGoal = stats.weekly_minutes_goal;
    
    // Calculate percentage (cap at 100%)
    return Math.min(Math.round((minutesPracticed / weeklyGoal) * 100), 100);
  };

  if (isLoading) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border border-white/10">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card className="bg-card/30 backdrop-blur-sm border border-white/10">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <h3 className="text-lg font-medium">Weekly Wellness Goal</h3>
              <span className="text-sm">
                {stats.total_minutes} / {stats.weekly_minutes_goal} minutes
              </span>
            </div>
            <Progress 
              value={getProgressPercentage()} 
              className="h-2 bg-white/10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-full">
                <Clock className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white/70">Total Minutes</p>
                <p className="text-lg font-semibold">{stats.total_minutes}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-full">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white/70">Sessions</p>
                <p className="text-lg font-semibold">{stats.total_sessions}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-full">
                <Calendar className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-white/70">Current Streak</p>
                <p className="text-lg font-semibold">{stats.current_streak} days</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-full">
                <BookOpen className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/70">Journal Entries</p>
                <p className="text-lg font-semibold">{stats.total_journal_entries}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WellnessStatsCard;
