import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/hooks/useUserProfile';
import { toast } from 'sonner';

export interface UserProfileData {
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  earned_badges: Badge[];
  // Musical identity fields
  primary_instruments?: string[] | null;
  secondary_instruments?: string[] | null;
  musical_interests?: string[] | null;
  skill_level?: string | null;
  location?: string | null;
  looking_for?: string[] | null;
  about_me?: string | null;
}

export const useUserProfileById = (userId: string) => {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError('No user ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Get user profile data
        const { data: profileInfo, error: profileError } = await supabase
          .from('profiles')
          .select('username, first_name, last_name, avatar_url, created_at, primary_instruments, secondary_instruments, musical_interests, skill_level, location, looking_for, about_me')
          .eq('id', userId)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        if (!profileInfo) {
          throw new Error('User profile not found');
        }
        
        // Get user's earned badges
        const { data: badgesData, error: badgesError } = await supabase
          .from('user_badges')
          .select(`
            earned_at,
            badges (
              id,
              title,
              description,
              icon,
              condition_type,
              threshold
            )
          `)
          .eq('user_id', userId);
          
        if (badgesError) {
          console.error('Error fetching badges:', badgesError);
        }
        
        // Format badges data
        const earnedBadges: Badge[] = (badgesData || []).map((item: any) => ({
          ...item.badges,
          earned_at: item.earned_at
        }));
        
        setProfileData({
          ...profileInfo,
          earned_badges: earnedBadges
        });
        
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to load user profile');
        toast.error('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId]);
  
  return {
    profileData,
    isLoading,
    error
  };
};