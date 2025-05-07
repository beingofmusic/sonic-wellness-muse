
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the UserRole type
export type UserRole = 'admin' | 'team' | 'user';

// Define the Profile type including role
export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
}

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signInWithGoogle: () => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isTeamMember: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch the user profile and permissions
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (profileData) {
        setProfile(profileData as Profile);
        
        // Fetch permissions based on user role
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('role_permissions')
          .select('permission')
          .eq('role', profileData.role);

        if (permissionsError) {
          console.error('Error fetching permissions:', permissionsError);
        } else if (permissionsData) {
          setPermissions(permissionsData.map(p => p.permission));
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user changes, fetch profile
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
          setPermissions([]);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await supabase.auth.signUp({
      email,
      password,
    });
    setIsLoading(false);
    return response;
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    return response;
  };

  const signInWithGoogle = async () => {
    const response = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return response;
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account.",
    });
  };

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  // Helper properties for role checks
  const isAdmin = profile?.role === 'admin';
  const isTeamMember = profile?.role === 'team';

  const value = {
    user,
    session,
    profile,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    isLoading,
    hasPermission,
    isAdmin,
    isTeamMember,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
