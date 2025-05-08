
import { useState, useEffect } from "react";
import { fetchPracticeStats, PracticeStats } from "@/services/practiceStatsService";
import { useToast } from "@/hooks/use-toast";

export const usePracticeStats = () => {
  const [stats, setStats] = useState<PracticeStats>({
    totalPracticeMinutes: 0,
    currentStreak: 0,
    sessionCount: 0,
    routineUsage: {},
    blockTypeBreakdown: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const practiceStats = await fetchPracticeStats();
      setStats(practiceStats);
    } catch (error) {
      console.error("Error fetching practice stats:", error);
      toast({
        title: "Error loading stats",
        description: "Could not load your practice statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Format minutes into a readable string (e.g., "2h 30m" or "45m")
  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return {
    stats,
    isLoading,
    refreshStats: fetchStats,
    formattedTotalTime: formatMinutes(stats.totalPracticeMinutes)
  };
};
