
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PermissionRouteProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

const PermissionRoute = ({ permission, children, fallback }: PermissionRouteProps) => {
  const { hasPermission, isLoading } = useAuth();
  const navigate = useNavigate();

  // If loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-music-primary"></div>
      </div>
    );
  }

  // If user doesn't have the required permission
  if (!hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="bg-red-500/10 border-red-500/30 text-white">
            <AlertDescription className="space-y-4">
              <p>You don't have permission to access this area.</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm font-medium transition-colors"
              >
                Return to Dashboard
              </button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // If user has permission, render the children
  return <>{children}</>;
};

export default PermissionRoute;
