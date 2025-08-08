import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export type RecentCommunityMessage = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  channel_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  channel_name: string;
  channel_slug: string;
  formatted_time: string;
};

export type ActiveUser = {
  user_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  message_count: number;
  latest_activity: string;
};

export const useRecentCommunityActivity = () => {
  const [recentMessages, setRecentMessages] = useState<RecentCommunityMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Fetch recent messages with user and channel info
        const { data: messagesData, error: messagesError } = await supabase
          .from('community_messages')
          .select(`
            id,
            content,
            created_at,
            user_id,
            channel_id,
            profiles!community_messages_user_id_fkey(
              username,
              first_name,
              last_name,
              avatar_url
            ),
            community_channels(
              name,
              slug
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (messagesError) throw messagesError;

        // Format recent messages with better error handling
        const formattedMessages: RecentCommunityMessage[] = (messagesData || []).map((msg: any) => {
          const profileData = msg.profiles || {};
          const channelData = msg.community_channels || {};
          
          return {
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            user_id: msg.user_id,
            channel_id: msg.channel_id,
            username: profileData.username || null,
            first_name: profileData.first_name || null,
            last_name: profileData.last_name || null,
            avatar_url: profileData.avatar_url || null,
            channel_name: channelData.name || 'Unknown Channel',
            channel_slug: channelData.slug || '',
            formatted_time: formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })
          };
        }).filter(msg => msg.content && msg.content.trim().length > 0); // Filter out empty messages

        setRecentMessages(formattedMessages);

        // Fetch active users from the past week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: activeUsersData, error: activeUsersError } = await supabase
          .from('community_messages')
          .select(`
            user_id,
            created_at,
            profiles!community_messages_user_id_fkey(
              username,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false });

        if (activeUsersError) throw activeUsersError;

        // Process active users data
        const userActivityMap = new Map<string, {
          profile: any;
          messageCount: number;
          latestActivity: string;
        }>();

        (activeUsersData || []).forEach((msg: any) => {
          const userId = msg.user_id;
          const existing = userActivityMap.get(userId);
          
          if (existing) {
            existing.messageCount += 1;
            if (msg.created_at > existing.latestActivity) {
              existing.latestActivity = msg.created_at;
            }
          } else {
            userActivityMap.set(userId, {
              profile: msg.profiles || {},
              messageCount: 1,
              latestActivity: msg.created_at
            });
          }
        });

        // Convert to array and sort by message count
        const formattedActiveUsers: ActiveUser[] = Array.from(userActivityMap.entries())
          .map(([userId, data]) => ({
            user_id: userId,
            username: data.profile.username || null,
            first_name: data.profile.first_name || null,
            last_name: data.profile.last_name || null,
            avatar_url: data.profile.avatar_url || null,
            message_count: data.messageCount,
            latest_activity: data.latestActivity
          }))
          .sort((a, b) => b.message_count - a.message_count)
          .slice(0, 5);

        setActiveUsers(formattedActiveUsers);

      } catch (error) {
        console.error('Error fetching community activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();

    // Subscribe to realtime updates for new messages
    const channel = supabase
      .channel('recent_community_activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
        },
        () => {
          // Refetch activity when new message arrives
          fetchRecentActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    recentMessages,
    activeUsers,
    loading
  };
};