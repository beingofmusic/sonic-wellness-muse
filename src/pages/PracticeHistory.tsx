
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { usePracticeHistory } from "@/hooks/usePracticeHistory";
import PracticeHistoryHeader from "@/components/practice/history/PracticeHistoryHeader";
import PracticeHistoryList from "@/components/practice/history/PracticeHistoryList";
import PracticeHistorySummary from "@/components/practice/history/PracticeHistorySummary";
import PracticeHistoryFilters from "@/components/practice/history/PracticeHistoryFilters";
import { Loader2 } from "lucide-react";

const PracticeHistory: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ 
    from: undefined, 
    to: undefined 
  });
  const [routineFilter, setRoutineFilter] = useState<string | null>(null);
  const [minDuration, setMinDuration] = useState<number | null>(null);
  
  const { 
    sessions, 
    isLoading, 
    totalTime, 
    sessionCount,
    topRoutines,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = usePracticeHistory({
    dateRange: dateRange.from && dateRange.to ? [dateRange.from, dateRange.to] : undefined,
    routineId: routineFilter,
    minDuration: minDuration,
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <PracticeHistoryHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary and filters column */}
          <div className="space-y-6">
            <PracticeHistorySummary 
              totalTime={totalTime} 
              sessionCount={sessionCount} 
              topRoutines={topRoutines}
            />
            
            <PracticeHistoryFilters 
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              routineFilter={routineFilter}
              onRoutineFilterChange={setRoutineFilter}
              minDuration={minDuration}
              onMinDurationChange={setMinDuration}
            />
          </div>
          
          {/* Sessions list column */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-60">
                <Loader2 className="h-8 w-8 animate-spin text-music-primary" />
              </div>
            ) : (
              <>
                <PracticeHistoryList sessions={sessions} />
                
                {hasNextPage && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-music-primary/10 text-music-primary hover:bg-music-primary/20 transition-colors"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading more...
                        </>
                      ) : (
                        "Load more sessions"
                      )}
                    </button>
                  </div>
                )}
                
                {sessions.length === 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                    <h3 className="text-xl font-medium mb-2">No practice sessions found</h3>
                    <p className="text-white/70">
                      {dateRange.from || routineFilter || minDuration 
                        ? "Try adjusting your filters"
                        : "Complete a practice session to see your history"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PracticeHistory;
