
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface RootRouteProps {
  children: React.ReactNode;
}

const RootRoute: React.FC<RootRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    // You could return a loading component here
    return <div>Loading...</div>;
  }
  
  if (user) {
    // Redirect to dashboard if user is already authenticated
    return <Navigate to="/dashboard" replace />;
  }
  
  // Render the component
  return <>{children}</>;
};

export default RootRoute;
