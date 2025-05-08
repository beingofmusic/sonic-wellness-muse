
import React from 'react';
import { Clock, CheckCircle, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatMinutes } from '@/lib/formatters';

interface PracticeHistorySummaryProps {
  totalTime: number;
  sessionCount: number;
  topRoutines: {
    id: string;
    title: string;
    count: number;
    totalDuration: number;
  }[];
}

const PracticeHistorySummary: React.FC<PracticeHistorySummaryProps> = ({
  totalTime,
  sessionCount,
  topRoutines
}) => {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Practice Summary</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-music-primary/20 p-2 rounded-full">
              <Clock className="h-5 w-5 text-music-primary" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total Time</p>
              <p className="text-xl font-medium">{formatMinutes(totalTime)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-music-secondary/20 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-music-secondary" />
            </div>
            <div>
              <p className="text-sm text-white/60">Completed Sessions</p>
              <p className="text-xl font-medium">{sessionCount}</p>
            </div>
          </div>
          
          {topRoutines.length > 0 && (
            <>
              <div className="h-px bg-white/10 my-4"></div>
              
              <div>
                <h4 className="text-sm font-medium mb-3 text-white/80">Top Routines</h4>
                <ul className="space-y-2">
                  {topRoutines.slice(0, 3).map(routine => (
                    <li key={routine.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-white/60" />
                        <span className="truncate max-w-[150px]">{routine.title}</span>
                      </div>
                      <span className="text-white/60">{routine.count}×</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PracticeHistorySummary;
