
import React from 'react';
import { PracticeSessionWithRoutine } from '@/services/practiceHistoryService';
import PracticeHistoryItem from './PracticeHistoryItem';

interface PracticeHistoryListProps {
  sessions: PracticeSessionWithRoutine[];
}

const PracticeHistoryList: React.FC<PracticeHistoryListProps> = ({ sessions }) => {
  // Group sessions by date
  const groupedSessions = React.useMemo(() => {
    const groups: Record<string, PracticeSessionWithRoutine[]> = {};
    
    sessions.forEach(session => {
      const date = session.formatted_date || 'Unknown Date';
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(session);
    });
    
    return Object.entries(groups).map(([date, sessionGroup]) => ({
      date,
      sessions: sessionGroup
    }));
  }, [sessions]);
  
  return (
    <div className="space-y-6">
      {groupedSessions.map(group => (
        <div key={group.date} className="space-y-3">
          <h3 className="text-lg font-medium border-b border-white/10 pb-2">{group.date}</h3>
          
          <div className="space-y-3">
            {group.sessions.map(session => (
              <PracticeHistoryItem key={session.id} session={session} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PracticeHistoryList;
