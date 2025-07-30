import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge, ProfileData } from '@/hooks/useUserProfile';

export const useUserProfileById = (userId?: string) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch profile data and badges for a specific user
  const fetchProfileData = async (targetUserId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get user profile
      const { data: profileResponse, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();
        
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          throw new Error('User profile not found');
        }
        throw profileError;
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
        .eq('user_id', targetUserId);
        
      if (badgesError) throw badgesError;
      
      // Format badges data
      const earnedBadges: Badge[] = (badgesData || []).map((item: any) => ({
        ...item.badges,
        earned_at: item.earned_at
      }));
      
      // Create profile data object
      setProfileData({
        username: profileResponse.username,
        first_name: profileResponse.first_name,
        last_name: profileResponse.last_name,
        email: null, // Don't expose email for privacy
        avatar_url: profileResponse.avatar_url,
        created_at: profileResponse.created_at,
        earned_badges: earnedBadges
      });
      
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setError(error.message || 'Failed to load profile');
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch profile data when userId changes
  useEffect(() => {
    if (userId) {
      fetchProfileData(userId);
    } else {
      setProfileData(null);
      setIsLoading(false);
      setError('No user ID provided');
    }
  }, [userId]);
  
  return {
    profileData,
    isLoading,
    error,
    refreshProfile: userId ? () => fetchProfileData(userId) : () => {}
  };
};