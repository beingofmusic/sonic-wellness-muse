import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type CommunityChannel = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export const useCommunityChannels = () => {
  const [channels, setChannels] = useState<CommunityChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from('community_channels')
          .select('*')
          .order('order_index', { ascending: true });

        if (error) throw error;
        setChannels(data || []);
      } catch (error) {
        console.error('Error fetching channels:', error);
        toast.error('Failed to load channels');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  return {
    channels,
    loading
  };
};