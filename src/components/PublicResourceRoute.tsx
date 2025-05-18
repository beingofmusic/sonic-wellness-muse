
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PublicResourceRouteProps {
  children: ReactNode;
  checkAccess?: (resourceId: string) => Promise<boolean>;
  fallbackPath?: string;
}

/**
 * A route component that allows access to both authenticated and unauthenticated users,
 * with an optional access check for specific resources.
 */
const PublicResourceRoute = ({ 
  children, 
  checkAccess,
  fallbackPath = '/signin' 
}: PublicResourceRouteProps) => {
  const { isLoading } = useAuth();
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    const checkResourceAccess = async () => {
      if (!checkAccess) return;
      
      // Extract resource ID from the URL path
      const pathParts = location.pathname.split('/');
      const resourceId = pathParts[pathParts.length - 1];
      
      if (resourceId) {
        setIsCheckingAccess(true);
        try {
          const hasPermission = await checkAccess(resourceId);
          setHasAccess(hasPermission);
        } catch (error) {
          console.error("Error checking resource access:", error);
          setHasAccess(false);
        } finally {
          setIsCheckingAccess(false);
        }
      }
    };
    
    checkResourceAccess();
  }, [location.pathname, checkAccess]);

  // Show loading state while checking auth or resource access
  if (isLoading || isCheckingAccess) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-music-primary"></div>
      </div>
    );
  }

  // Redirect if access is denied
  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If access is allowed or no check is needed, render the children
  return <>{children}</>;
};

export default PublicResourceRoute;
