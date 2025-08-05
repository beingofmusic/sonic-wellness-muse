
import React, { useState } from 'react';
import { PracticeSessionWithRoutine } from '@/services/practiceHistoryService';
import { Card, CardContent } from '@/components/ui/card';
import { formatMinutes } from '@/lib/formatters';
import { Clock, Music, CheckCircle, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SessionRecordingPlayer from './SessionRecordingPlayer';

interface PracticeHistoryItemProps {
  session: PracticeSessionWithRoutine;
}

const PracticeHistoryItem: React.FC<PracticeHistoryItemProps> = ({ session }) => {
  const [showRecordingPlayer, setShowRecordingPlayer] = useState(false);
  
  // Get block type breakdown if available
  const blockTypes = React.useMemo(() => {
    if (!session.block_breakdown?.blockTypes) return [];
    
    return Object.keys(session.block_breakdown.blockTypes);
  }, [session]);
  
  // Function to get icon based on routine title or block types
  const getRoutineIcon = () => {
    const title = session.routine_title?.toLowerCase() || '';
    
    if (session.routine_id === 'open-practice') {
      return <span className="text-lg">🌀</span>;
    } else if (title.includes('technique') || title.includes('technical')) {
      return <Music className="h-5 w-5 text-music-primary" />;
    } else if (title.includes('mindfulness') || title.includes('meditation')) {
      return <Clock className="h-5 w-5 text-music-secondary" />;
    } else {
      return <Music className="h-5 w-5 text-music-tertiary" />;
    }
  };
  
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:bg-white/8 transition-colors">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="bg-music-primary/10 p-3 rounded-full">
          {getRoutineIcon()}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium truncate">
                {session.routine_id === 'open-practice' ? 'Open Practice' : session.routine_title}
              </h4>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className="whitespace-nowrap">{session.formatted_time}</span>
                <span className="h-1 w-1 bg-white/30 rounded-full"></span>
                <span>{formatMinutes(session.total_duration)}</span>
                {session.routine_id === 'open-practice' && (
                  <>
                    <span className="h-1 w-1 bg-white/30 rounded-full"></span>
                    <span className="text-music-primary">Freestyle</span>
                  </>
                )}
              </div>
            </div>
            
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          </div>
          
          {/* Tags or block types */}
          {(session.routine_tags?.length > 0 || blockTypes.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {session.routine_tags?.map((tag, index) => (
                <Badge 
                  key={index} 
                  className="bg-music-primary/20 text-music-primary hover:bg-music-primary/30 text-xs"
                >
                  {tag}
                </Badge>
              ))}
              
              {blockTypes.slice(0, 3).map((type, index) => (
                <Badge 
                  key={`block-${index}`} 
                  variant="outline"
                  className="border-music-secondary/30 text-music-secondary/90 text-xs"
                >
                  {type}
                </Badge>
              ))}
              
              {blockTypes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{blockTypes.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Recording button */}
          {session.recording && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecordingPlayer(true)}
              className="p-2 h-8 w-8 bg-music-primary/10 hover:bg-music-primary/20 text-music-primary"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          )}
          
          {/* Practice Again button */}
          {session.routine_id && session.routine_id !== 'open-practice' && (
            <Link 
              to={`/practice/routine/${session.routine_id}`}
              className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors whitespace-nowrap"
            >
              Practice Again
            </Link>
          )}
          
          {/* Open Practice Again button */}
          {session.routine_id === 'open-practice' && (
            <Link 
              to="/practice/routine/open-practice"
              className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors whitespace-nowrap"
            >
              Open Practice
            </Link>
          )}
        </div>
        
        {/* Recording Player Modal */}
        {session.recording && (
          <SessionRecordingPlayer
            recording={{
              id: session.recording.id,
              user_id: session.user_id,
              session_id: session.id,
              title: session.recording.title,
              recording_url: session.recording.recording_url,
              notes: session.recording.notes,
              tags: session.recording.tags,
              duration_seconds: session.recording.duration_seconds,
              created_at: session.recording.created_at
            }}
            isOpen={showRecordingPlayer}
            onClose={() => setShowRecordingPlayer(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PracticeHistoryItem;
