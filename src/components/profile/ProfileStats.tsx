
import React, { useEffect, useState } from "react";
import { Clock, Calendar, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import { formatMinutes } from "@/lib/formatters";
import { toast } from "sonner";

interface ProfileStatsProps {
  isLoading: boolean;
  userId?: string;
}

// Format minutes into a readable string (e.g., "2h 30m" or "45m")
const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const ProfileStats: React.FC<ProfileStatsProps> = ({ isLoading, userId }) => {
  const { user } = useAuth();
  const { stats: currentUserStats, formattedTotalTime: currentUserTime } = usePracticeStats();
  const [otherUserStats, setOtherUserStats] = useState<any>(null);
  const [isLoadingOtherStats, setIsLoadingOtherStats] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determine if we're showing current user stats or another user's stats
  const isCurrentUser = !userId || (user && userId === user.id);
  
  // Fetch stats for another user if needed
  useEffect(() => {
    if (!isCurrentUser && userId) {
      const fetchUserStats = async () => {
        setIsLoadingOtherStats(true);
        setErrorMessage(null);
        
        try {
          console.log("Fetching stats for user ID:", userId);
          
          // Get total practice minutes
          const { data: practiceData, error: practiceError } = await supabase
            .from("practice_sessions")
            .select("total_duration")
            .eq("user_id", userId);
            
          if (practiceError) {
            console.error("Error fetching practice sessions:", practiceError);
            setErrorMessage("Failed to load practice data");
            throw practiceError;
          }
          
          const totalMinutes = practiceData?.reduce((sum, session) => sum + (session.total_duration || 0), 0) || 0;
          console.log("Total practice minutes:", totalMinutes);
          
          // Get session count
          const { count: sessionCount, error: countError } = await supabase
            .from("practice_sessions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);
            
          if (countError) {
            console.error("Error fetching session count:", countError);
            throw countError;
          }
          
          console.log("Session count:", sessionCount);
          
          // Get streak information from leaderboard function
          const { data: streakData, error: streakError } = await supabase
            .rpc("get_streak_leaderboard");
            
          if (streakError) {
            console.error("Error fetching streak data:", streakError);
            throw streakError;
          }
          
          // Find user in streak data
          const userStreakInfo = streakData?.find((item: any) => item.user_id === userId);
          const currentStreak = userStreakInfo?.current_streak || 0;
          console.log("Current streak:", currentStreak);
          
          setOtherUserStats({
            totalPracticeMinutes: totalMinutes,
            sessionCount: sessionCount || 0,
            currentStreak
          });
        } catch (error) {
          console.error("Error fetching user stats:", error);
          setOtherUserStats({
            totalPracticeMinutes: 0,
            sessionCount: 0,
            currentStreak: 0
          });
          // Don't show toast for stats errors to avoid cluttering the UI
        } finally {
          setIsLoadingOtherStats(false);
        }
      };
      
      fetchUserStats();
    }
  }, [userId, isCurrentUser, user]);
  
  // Determine which stats to use
  const stats = isCurrentUser ? currentUserStats : otherUserStats;
  const formattedTotalTime = isCurrentUser ? currentUserTime : (otherUserStats ? formatTime(otherUserStats.totalPracticeMinutes) : "0 min");
  const isStatsLoading = isLoading || (isLoadingOtherStats && !isCurrentUser);

  const statItems = [
    {
      icon: <Clock className="h-5 w-5 text-music-primary" />,
      label: "Total Practice",
      value: formattedTotalTime,
    },
    {
      icon: <Calendar className="h-5 w-5 text-music-secondary" />,
      label: "Current Streak",
      value: `${stats?.currentStreak || 0} days`,
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-music-tertiary" />,
      label: "Sessions Completed",
      value: `${stats?.sessionCount || 0}`,
    },
  ];

  if (isStatsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/5"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-4 text-center">
        <p className="text-white/70">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statItems.map((item, index) => (
        <div 
          key={index}
          className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/5"
        >
          <div className="p-2 bg-white/5 rounded-full">
            {item.icon}
          </div>
          <div>
            <p className="text-sm text-white/70">{item.label}</p>
            <p className="text-xl font-semibold">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;
