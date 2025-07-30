import React from 'react';
import { Link } from 'react-router-dom';

interface ClickableUserProfileProps {
  userId: string;
  children: React.ReactNode;
  className?: string;
}

const ClickableUserProfile: React.FC<ClickableUserProfileProps> = ({ 
  userId, 
  children, 
  className = "" 
}) => {
  return (
    <Link 
      to={`/profile/${userId}`}
      className={`hover:opacity-80 transition-opacity cursor-pointer ${className}`}
    >
      {children}
    </Link>
  );
};

export default ClickableUserProfile;