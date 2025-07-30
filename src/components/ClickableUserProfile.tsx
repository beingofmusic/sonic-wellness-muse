import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ClickableUserProfileProps {
  userId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
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
  showAvatar = false,
  className = "",
  children
}) => {
  const navigate = useNavigate();

  const getDisplayName = () => {
    if (firstName) {
      const lastNamePart = lastName ? ` ${lastName}` : '';
      return `${firstName}${lastNamePart}`;
    }
    if (username) return username;
    return "User";
  };

  const getInitials = () => {
    if (firstName) {
      const firstInitial = firstName.charAt(0).toUpperCase();
      const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
      return `${firstInitial}${lastInitial}`;
    }
    if (username) return username.charAt(0).toUpperCase();
    return "U";
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  if (children) {
    return (
      <span 
        onClick={handleClick}
        className={`cursor-pointer hover:text-music-primary transition-colors ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className={`flex items-center gap-2 cursor-pointer hover:text-music-primary transition-colors ${className}`}
    >
      {showAvatar && (
        <Avatar className="h-6 w-6">
          <AvatarImage src={avatarUrl || ''} alt={getDisplayName()} />
          <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
        </Avatar>
      )}
      <span className="truncate">{getDisplayName()}</span>
    </div>
  );
};

export default ClickableUserProfile;