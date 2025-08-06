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
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  // Musical identity fields
  primary_instruments?: string[] | null;
  secondary_instruments?: string[] | null;
  musical_interests?: string[] | null;
  skill_level?: string | null;
  location?: string | null;
  looking_for?: string[] | null;
  about_me?: string | null;
}

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signUp: (email: string, password: string, metadata?: { first_name?: string, last_name?: string }) => Promise<{
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
        // Cast the profile data to our Profile type since Supabase types don't include the role yet
        const typedProfile: Profile = {
          id: profileData.id,
          username: profileData.username,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          avatar_url: profileData.avatar_url,
          // If role is undefined, default to 'user'
          role: (profileData as any).role || 'user',
          // Musical identity fields
          primary_instruments: (profileData as any).primary_instruments || null,
          secondary_instruments: (profileData as any).secondary_instruments || null,
          musical_interests: (profileData as any).musical_interests || null,
          skill_level: (profileData as any).skill_level || null,
          location: (profileData as any).location || null,
          looking_for: (profileData as any).looking_for || null,
          about_me: (profileData as any).about_me || null,
        };
        
        setProfile(typedProfile);
        
        try {
          // Directly fetch permissions from role_permissions table
          const { data: directPermissions, error: directPermError } = await supabase
            .from('role_permissions')
            .select('permission')
            .eq('role', typedProfile.role);
            
          if (directPermError) {
            console.error('Error fetching permissions:', directPermError);
          } else if (directPermissions) {
            setPermissions(directPermissions.map(p => p.permission as string));
          }
        } catch (error) {
          console.error('Error in permissions fetch:', error);
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

  const signUp = async (email: string, password: string, metadata?: { first_name?: string, last_name?: string }) => {
    setIsLoading(true);
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      }
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
