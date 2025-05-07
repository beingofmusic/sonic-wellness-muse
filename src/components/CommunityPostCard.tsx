
import React from "react";

interface CommunityPostCardProps {
  userName: string;
  timeAgo: string;
  message: string;
  reactionCount: number;
  onReply?: () => void;
}

const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  userName,
  timeAgo,
  message,
  reactionCount,
  onReply
}) => {
  return (
    <div className="p-3 bg-card/80 rounded-lg border border-white/10 mb-2">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-music-primary/20 flex items-center justify-center">
          <span className="text-sm font-medium text-music-primary">{userName.charAt(0)}{userName.split(' ')?.[1]?.charAt(0) || ''}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{userName}</span>
          <span className="text-xs text-white/50">{timeAgo}</span>
        </div>
      </div>
      <p className="text-sm text-white/80 mb-2">{message}</p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/50">{reactionCount} reactions</span>
        <button 
          onClick={onReply}
          className="text-xs text-music-primary hover:text-music-light transition-colors"
        >
          Reply
        </button>
      </div>
    </div>
  );
};

export default CommunityPostCard;
