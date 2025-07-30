import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserProfileData {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

export const useUserProfileById = (userId: string) => {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, avatar_url, created_at')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setProfileData(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
      toast.error('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  return {
    profileData,
    isLoading,
    error,
    refetch: fetchProfileData
  };
};