import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ClickableUserProfileProps {
  userId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  displayName?: string;
  showAvatar?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const ClickableUserProfile: React.FC<ClickableUserProfileProps> = ({
  userId,
  username,
  firstName,
  lastName,
  avatarUrl,
  displayName,
  showAvatar = false,
  className = "",
  children
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/profile/${userId}`);
  };

  // Get display name from user data
  const getDisplayName = (): string => {
    if (displayName) return displayName;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (username) {
      return username;
    }
    return 'Anonymous';
  };

  // Get avatar initials
  const getInitials = (): string => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (username) {
      return username[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
    >
      {showAvatar && (
        <Avatar className="h-6 w-6">
          <AvatarImage src={avatarUrl || ''} alt={getDisplayName()} />
          <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
        </Avatar>
      )}
      {children || <span>{getDisplayName()}</span>}
    </button>
  );
};

export default ClickableUserProfile;