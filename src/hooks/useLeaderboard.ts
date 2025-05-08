
import { useState, useEffect } from "react";
import { fetchLeaderboardData, LeaderboardData } from "@/services/leaderboardService";
import { useToast } from "@/hooks/use-toast";

export const useLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    weeklyTime: [],
    allTimeTime: [],
    currentStreak: [],
    userRank: {},
    loading: true,
    error: null
  });
  
  const { toast } = useToast();
  
  const fetchData = async () => {
    try {
      const data = await fetchLeaderboardData();
      setLeaderboardData({
        ...data,
        loading: false
      });
    } catch (error) {
      console.error("Error in useLeaderboard:", error);
      setLeaderboardData(prev => ({
        ...prev,
        loading: false,
        error: "Failed to load leaderboard data"
      }));
      
      toast({
        title: "Error",
        description: "Could not load leaderboard data",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  return {
    ...leaderboardData,
    refetch: fetchData
  };
};
