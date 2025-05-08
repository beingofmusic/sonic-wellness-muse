
import { useState, useEffect } from 'react';
import { fetchPracticeSessions, PracticeSessionWithRoutine } from '@/services/practiceHistoryService';
import { useToast } from '@/hooks/use-toast';

interface UsePracticeHistoryOptions {
  dateRange?: [Date, Date];
  routineId?: string | null;
  minDuration?: number | null;
  pageSize?: number;
}

interface TopRoutine {
  id: string;
  title: string;
  count: number;
  totalDuration: number;
}

export const usePracticeHistory = ({
  dateRange,
  routineId,
  minDuration,
  pageSize = 10
}: UsePracticeHistoryOptions = {}) => {
  const [sessions, setSessions] = useState<PracticeSessionWithRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [topRoutines, setTopRoutines] = useState<TopRoutine[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  
  const { toast } = useToast();

  const loadSessions = async (page = 0, append = false) => {
    const isInitialLoad = page === 0 && !append;
    
    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsFetchingNextPage(true);
    }
    
    try {
      const { 
        sessions: fetchedSessions, 
        hasMore, 
        totalPracticeTime,
        totalSessions,
        routineSummary
      } = await fetchPracticeSessions({
        page,
        pageSize,
        dateRange,
        routineId,
        minDuration
      });
      
      setSessions(prev => append ? [...prev, ...fetchedSessions] : fetchedSessions);
      setHasNextPage(hasMore);
      
      if (isInitialLoad) {
        setTotalTime(totalPracticeTime);
        setSessionCount(totalSessions);
        
        // Process top routines
        const routines = routineSummary || [];
        setTopRoutines(
          routines.map(r => ({
            id: r.id,
            title: r.title || 'Unnamed Routine',
            count: r.count || 0,
            totalDuration: r.totalDuration || 0
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching practice sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load practice history.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsFetchingNextPage(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
    loadSessions(0, false);
  }, [dateRange, routineId, minDuration, pageSize]);
  
  const fetchNextPage = async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await loadSessions(nextPage, true);
  };
  
  return {
    sessions,
    isLoading,
    totalTime,
    sessionCount,
    topRoutines,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
};
