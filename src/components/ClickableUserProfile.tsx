import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ClickableUserProfileProps {
  userId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  showAvatar?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const ClickableUserProfile: React.FC<ClickableUserProfileProps> = ({
  userId,
  username,
  firstName,
  lastName,
  avatarUrl,
  showAvatar = false,
  size = 'sm',
  className = '',
  children
}) => {
  // Get display name
  const getDisplayName = (): string => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (username) {
      return username;
    }
    return 'Anonymous';
  };

  // Get initials for avatar
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

  // Size configurations
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };

  const content = children || getDisplayName();

  return (
    <Link 
      to={`/profile/${userId}`}
      className={`inline-flex items-center gap-2 hover:text-music-primary transition-colors ${className}`}
    >
      {showAvatar && (
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={avatarUrl || ''} alt={getDisplayName()} />
          <AvatarFallback className="bg-music-primary/20 text-music-primary">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      )}
      <span>{content}</span>
    </Link>
  );
};

export default ClickableUserProfile;