import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeaderboardEntry } from '@/services/leaderboardService';
import { formatMinutes } from '@/lib/formatters';
import UserProfileLink from '@/components/profile/UserProfileLink';

interface LeaderboardCardProps {
  title: string;
  entries: LeaderboardEntry[];
  isLoading: boolean;
  userRank?: number;
  valueLabel: string;
  icon: React.ReactNode;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  title,
  entries,
  isLoading,
  userRank,
  valueLabel,
  icon
}) => {
  // Get display name from user data
  const getDisplayName = (entry: LeaderboardEntry): string => {
    if (entry.first_name && entry.last_name) {
      return `${entry.first_name} ${entry.last_name}`;
    } else if (entry.first_name) {
      return entry.first_name;
    } else if (entry.username) {
      return entry.username;
    }
    return 'Anonymous';
  };
  
  // Get avatar initials
  const getInitials = (entry: LeaderboardEntry): string => {
    if (entry.first_name && entry.last_name) {
      return `${entry.first_name[0]}${entry.last_name[0]}`.toUpperCase();
    } else if (entry.first_name) {
      return entry.first_name[0].toUpperCase();
    } else if (entry.username) {
      return entry.username[0].toUpperCase();
    }
    return 'U';
  };
  
  // Format value based on valueLabel
  const formatValue = (value: number): string => {
    if (valueLabel === 'minutes') {
      return formatMinutes(value);
    } else if (valueLabel === 'days') {
      return `${value} day${value !== 1 ? 's' : ''}`;
    }
    return String(value);
  };
  
  // Get medal color based on rank
  const getMedalColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'bg-amber-500'; // Gold
      case 2:
        return 'bg-gray-300'; // Silver
      case 3:
        return 'bg-amber-700'; // Bronze
      default:
        return 'bg-gray-500';
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center p-2 animate-pulse">
              <div className="w-5 h-5 rounded-full bg-white/10 mr-2"></div>
              <div className="h-4 bg-white/10 rounded w-24 mr-auto"></div>
              <div className="h-4 bg-white/10 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // When no data
  if (entries.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <div className="py-4 text-center text-sm text-white/50">
          No leaderboard data yet
        </div>
      </div>
    );
  }
  
  // Display the leaderboard
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      
      {/* Entries */}
      <div className="space-y-2">
        {entries.map((entry) => {
          // Ensure user_id is a valid string before passing it to UserProfileLink
          const userId = entry.user_id ? String(entry.user_id) : '';
          
          return (
            <div 
              key={entry.id || `rank-${entry.rank}`} 
              className={`flex items-center p-2 rounded-md ${entry.isCurrentUser ? 'bg-white/5 border border-music-primary/30' : ''}`}
            >
              <div className={`w-5 h-5 rounded-full ${getMedalColor(entry.rank)} flex items-center justify-center text-xs font-semibold mr-2`}>
                {entry.rank}
              </div>
              
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={entry.avatar_url || ''} alt={getDisplayName(entry)} />
                <AvatarFallback className="text-xs">{getInitials(entry)}</AvatarFallback>
              </Avatar>
              
              <span className="text-sm truncate mr-auto">
                {userId ? (
                  <UserProfileLink 
                    userId={userId}
                    firstName={entry.first_name}
                    lastName={entry.last_name}
                    username={entry.username}
                  />
                ) : (
                  getDisplayName(entry)
                )}
                {entry.isCurrentUser && <span className="text-xs ml-1.5 text-music-primary">(You)</span>}
              </span>
              
              <span className="text-sm font-medium">
                {formatValue(entry.value)}
              </span>
            </div>
          );
        })}
        
        {/* User's rank if not in top 3 */}
        {userRank && userRank > 3 && (
          <>
            <div className="h-px bg-white/10 my-1"></div>
            <div className="flex items-center p-2 rounded-md bg-white/5">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs mr-2">
                {userRank}
              </div>
              <span className="text-sm truncate mr-auto">You</span>
              <span className="text-sm font-medium text-music-primary">
                View all
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardCard;
