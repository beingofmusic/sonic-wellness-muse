
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type ChatMessage = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
};

export const useCommunityChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const { user, profile } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        console.log('Fetching messages...');
        const { data, error } = await supabase
          .from('community_messages')
          .select(`
            id,
            content,
            created_at,
            user_id,
            profiles(
              username,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: true })
          .limit(100);

        if (error) throw error;
        
        console.log('Raw message data:', JSON.stringify(data, null, 2));

        // Transform data to include profile info directly in each message
        const formattedMessages = data.map((msg: any) => {
          // Extract profile data from the nested object
          return {
            id: msg.id,
            user_id: msg.user_id,
            content: msg.content,
            created_at: msg.created_at,
            username: msg.profiles?.username || null,
            first_name: msg.profiles?.first_name || null,
            last_name: msg.profiles?.last_name || null,
            avatar_url: msg.profiles?.avatar_url || null,
          };
        });

        console.log('Formatted messages:', JSON.stringify(formattedMessages, null, 2));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load chat messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('community_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
        },
        async (payload) => {
          console.log('New message received:', payload);
          // When we get a new message, fetch the profile information
          const { data, error } = await supabase
            .from('profiles')
            .select('username, first_name, last_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          console.log('Profile data for new message:', data, error);

          if (!error && data) {
            const newMsg: ChatMessage = {
              id: payload.new.id,
              user_id: payload.new.user_id,
              content: payload.new.content,
              created_at: payload.new.created_at,
              username: data.username || null,
              first_name: data.first_name || null,
              last_name: data.last_name || null,
              avatar_url: data.avatar_url || null,
            };
            setMessages((prev) => [...prev, newMsg]);
            
            // Scroll to bottom on new message
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          } else {
            // Even if we can't fetch the profile, still add the message
            const newMsg: ChatMessage = {
              id: payload.new.id,
              user_id: payload.new.user_id,
              content: payload.new.content,
              created_at: payload.new.created_at
            };
            setMessages((prev) => [...prev, newMsg]);
            
            // Scroll to bottom on new message
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
  }, []);

  // Function to send a new message
  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    try {
      const { error } = await supabase.from('community_messages').insert({
        user_id: user.id,
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
