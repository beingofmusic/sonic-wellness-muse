
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePracticeStats } from '@/hooks/usePracticeStats';
import { toast } from 'sonner';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition_type: string;
  threshold: number;
  earned_at: string;
}

export interface ProfileData {
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
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

export const useUserProfile = () => {
  const { user, profile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { stats } = usePracticeStats();
  
  // Fetch profile data and badges
  const fetchProfileData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
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
        .eq('user_id', user.id);
        
      if (badgesError) throw badgesError;
      
      // Format badges data
      const earnedBadges: Badge[] = badgesData.map((item: any) => ({
        ...item.badges,
        earned_at: item.earned_at
      }));
      
      // Create profile data object
      setProfileData({
        username: profile?.username || null,
        first_name: profile?.first_name || null,
        last_name: profile?.last_name || null,
        email: user.email || null,
        avatar_url: profile?.avatar_url || null,
        created_at: user.created_at || null,
        earned_badges: earnedBadges,
        // Musical identity fields
        primary_instruments: profile?.primary_instruments || null,
        secondary_instruments: profile?.secondary_instruments || null,
        musical_interests: profile?.musical_interests || null,
        skill_level: profile?.skill_level || null,
        location: profile?.location || null,
        looking_for: profile?.looking_for || null,
        about_me: profile?.about_me || null,
      });
      
      // Check and award badges based on current stats
      await checkForBadges();
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check for badges based on current stats
  const checkForBadges = async () => {
    if (!user) return;
    
    try {
      await supabase.rpc('check_and_award_badges', { user_uuid: user.id });
    } catch (error) {
      console.error('Error checking for badges:', error);
    }
  };
  
  // Update profile information
  const updateProfile = async (data: { 
    first_name?: string; 
    last_name?: string; 
    avatar_url?: string;
    primary_instruments?: string[];
    secondary_instruments?: string[];
    musical_interests?: string[];
    skill_level?: string;
    location?: string;
    looking_for?: string[];
    about_me?: string;
  }) => {
    if (!user) return false;
    
    try {
      setIsSaving(true);
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success('Profile updated successfully');
      await fetchProfileData();
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  // Fetch profile data on mount or when user/profile changes
  useEffect(() => {
    if (user && profile) {
      fetchProfileData();
    } else {
      setProfileData(null);
    }
  }, [user, profile]);
  
  return {
    profileData,
    isLoading,
    isSaving,
    updateProfile,
    refreshProfile: fetchProfileData
  };
};
