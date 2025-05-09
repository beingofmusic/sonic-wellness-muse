
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ChatMessage as ChatMessageType } from "@/hooks/useCommunityChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // Format the timestamp to be more readable
  const formattedTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  
  // Get full name display (first + last name)
  const getFullName = () => {
    if (message.first_name) {
      const lastName = message.last_name ? ` ${message.last_name}` : '';
      return `${message.first_name}${lastName}`;
    }
    if (message.username) return message.username;
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
        <Avatar className="w-8 h-8">
          {message.avatar_url ? (
            <AvatarImage 
              src={message.avatar_url} 
              alt={getFullName()} 
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="bg-music-primary/20 text-music-primary text-sm">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline mb-1">
            <span className="font-medium text-white mr-2 truncate">{getFullName()}</span>
            <span className="text-xs text-white/50">{formattedTime}</span>
          </div>
          <p className="text-sm text-white/90 break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
