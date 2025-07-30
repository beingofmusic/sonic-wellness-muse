
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ChatMessage as ChatMessageType } from "@/hooks/useCommunityChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ClickableUserProfile from "@/components/ClickableUserProfile";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // Format the timestamp to be more readable
  const formattedTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  
  // Get full name display (first + last name)
  const getFullName = () => {
    // First priority: Use first and last name if available
    if (message.first_name) {
      const lastName = message.last_name ? ` ${message.last_name}` : '';
      return `${message.first_name}${lastName}`;
    }
    
    // Second priority: Use username if first name isn't available
    if (message.username) {
      return message.username;
    }
    
    // If we have a user_id but no name info, indicate this more clearly
    if (message.user_id) {
      return "User";
    }
    
    // Fallback: Anonymous user
    return "Anonymous User";
  };

  // Get initials for the avatar
  const getInitials = () => {
    if (message.first_name) {
      const firstInitial = message.first_name.charAt(0).toUpperCase();
      const lastInitial = message.last_name ? message.last_name.charAt(0).toUpperCase() : '';
      return `${firstInitial}${lastInitial}`;
    }
    if (message.username) return message.username.charAt(0).toUpperCase();
    if (message.user_id) return "U"; // For users with ID but no name
    return "?";
  };

  // Log any messages with missing profile data to help debugging
  if (!message.first_name && !message.username && message.user_id) {
    console.log('Message with missing profile data:', message);
  }

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
            <ClickableUserProfile
              userId={message.user_id}
              username={message.username}
              firstName={message.first_name}
              lastName={message.last_name}
              avatarUrl={message.avatar_url}
              className="font-medium text-white mr-2 truncate"
            />
            <span className="text-xs text-white/50">{formattedTime}</span>
          </div>
          <p className="text-sm text-white/90 break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
