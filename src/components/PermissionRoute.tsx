
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PermissionRouteProps {
  requiredPermission: string;
  children: React.ReactNode;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ requiredPermission, children }) => {
  const { user, isLoading, hasPermission } = useAuth();
  
  if (isLoading) {
    // You could return a loading component here
    return <div>Loading...</div>;
  }
  
  if (!user) {
    // Redirect to sign-in if user is not authenticated
    return <Navigate to="/signin" replace />;
  }
  
  if (!hasPermission(requiredPermission)) {
    // Redirect to dashboard if user doesn't have the required permission
    return <Navigate to="/dashboard" replace />;
  }
  
  // Render the protected component
  return <>{children}</>;
};

export default PermissionRoute;
