import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type ChannelMessage = {
  id: string;
  user_id: string;
  channel_id: string;
  content: string;
  created_at: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
};

export const useChannelChat = (channelId: string | null) => {
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages when channel changes
  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      try {
        console.log('Fetching messages for channel:', channelId);
        const { data, error } = await supabase
          .from('community_messages')
          .select(`
            id,
            content,
            created_at,
            user_id,
            channel_id,
            profiles(
              username,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('channel_id', channelId)
          .order('created_at', { ascending: true })
          .limit(100);

        if (error) throw error;
        
        console.log('Raw channel messages:', data);

        // Transform data to include profile info directly in each message
        const formattedMessages = data.map((msg: any) => {
          const profileData = msg.profiles || null;
          
          return {
            id: msg.id,
            user_id: msg.user_id,
            channel_id: msg.channel_id,
            content: msg.content,
            created_at: msg.created_at,
            username: profileData?.username || null,
            first_name: profileData?.first_name || null,
            last_name: profileData?.last_name || null,
            avatar_url: profileData?.avatar_url || null,
          };
        });

        console.log('Formatted channel messages:', formattedMessages);
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching channel messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to realtime changes for this channel
    const channel = supabase
      .channel(`community_messages_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          console.log('New channel message received:', payload);
          
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('username, first_name, last_name, avatar_url')
              .eq('id', payload.new.user_id)
              .single();

            const newMsg: ChannelMessage = {
              id: payload.new.id,
              user_id: payload.new.user_id,
              channel_id: payload.new.channel_id,
              content: payload.new.content,
              created_at: payload.new.created_at,
              username: profileData?.username || null,
              first_name: profileData?.first_name || null,
              last_name: profileData?.last_name || null,
              avatar_url: profileData?.avatar_url || null,
            };
            
            setMessages((prev) => [...prev, newMsg]);
            
            // Scroll to bottom on new message
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          } catch (error) {
            console.error('Error fetching profile for new message:', error);
            // Still add the message even if we can't fetch the profile
            const newMsg: ChannelMessage = {
              id: payload.new.id,
              user_id: payload.new.user_id,
              channel_id: payload.new.channel_id,
              content: payload.new.content,
              created_at: payload.new.created_at
            };
            setMessages((prev) => [...prev, newMsg]);
            
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  // Function to send a new message
  const sendMessage = async () => {
    if (!user || !newMessage.trim() || !channelId) return;

    try {
      const { error } = await supabase.from('community_messages').insert({
        user_id: user.id,
        channel_id: channelId,
        content: newMessage.trim(),
      });

      if (error) throw error;
      
      // Clear input after sending
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return {
    messages,
    loading,
    newMessage,
    setNewMessage,
    sendMessage,
    scrollRef,
  };
};