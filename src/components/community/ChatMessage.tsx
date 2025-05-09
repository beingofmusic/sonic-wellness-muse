
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ChatMessage as ChatMessageType } from "@/hooks/useCommunityChat";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // Format the timestamp to be more readable
  const formattedTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  
  // Get display name (username or first name + last initial)
  const getDisplayName = () => {
    if (message.username) return message.username;
    if (message.first_name) {
      const lastInitial = message.last_name ? ` ${message.last_name.charAt(0)}.` : '';
      return `${message.first_name}${lastInitial}`;
    }
    return "User";
  };

  // Get initials for the avatar
  const getInitials = () => {
    if (message.first_name) {
      const firstInitial = message.first_name.charAt(0);
      const lastInitial = message.last_name ? message.last_name.charAt(0) : '';
      return `${firstInitial}${lastInitial}`;
    }
    if (message.username) return message.username.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className="p-3 hover:bg-white/5 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-music-primary/20 flex items-center justify-center shrink-0">
          {message.avatar_url ? (
            <img 
              src={message.avatar_url} 
              alt={getDisplayName()} 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-music-primary">{getInitials()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline mb-1">
            <span className="font-medium text-white mr-2 truncate">{getDisplayName()}</span>
            <span className="text-xs text-white/50">{formattedTime}</span>
          </div>
          <p className="text-sm text-white/90 break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
