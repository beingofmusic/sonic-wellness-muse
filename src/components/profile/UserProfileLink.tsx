
import React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface UserProfileLinkProps {
  userId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  className?: string;
  withHoverEffect?: boolean;
}

const UserProfileLink: React.FC<UserProfileLinkProps> = ({
  userId,
  username,
  firstName,
  lastName,
  className = "",
  withHoverEffect = true
}) => {
  // Get display name with priority: full name > first name > username
  const getDisplayName = (): string => {
    if (firstName) {
      return lastName ? `${firstName} ${lastName}` : firstName;
    }
    if (username) return username;
    return "User";
  };
  
  const handleClick = (e: React.MouseEvent) => {
    // Ensure userId is a valid, non-empty string
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      e.preventDefault();
      toast.error("Cannot view profile: Invalid user ID");
      return;
    }
  };

  const hoverClass = withHoverEffect ? "hover:text-music-primary hover:underline transition-colors" : "";
  
  return (
    <Link 
      to={`/users/${userId}`} 
      className={`${hoverClass} ${className}`}
      onClick={handleClick}
      title={`View ${getDisplayName()}'s profile`}
    >
      {getDisplayName()}
    </Link>
  );
};

export default UserProfileLink;
