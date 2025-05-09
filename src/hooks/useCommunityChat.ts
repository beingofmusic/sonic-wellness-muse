
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
          
          try {
            // When we get a new message, fetch the complete message with profile information
            // Use a more explicit join to ensure we get the profile data
            const { data, error } = await supabase
              .from('community_messages')
              .select(`
                id,
                content,
                created_at,
                user_id,
                profiles!inner(
                  username,
                  first_name,
                  last_name,
                  avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              // If the inner join fails, try without it
              console.warn('Inner join failed, trying regular join:', error);
              
              const fallbackQuery = await supabase
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
                .eq('id', payload.new.id)
                .single();
                
              if (fallbackQuery.error) throw fallbackQuery.error;
              
              if (!fallbackQuery.data) throw new Error('No message data found');
              
              // Use the fallback query data instead
              const newMsg: ChatMessage = {
                id: fallbackQuery.data.id,
                user_id: fallbackQuery.data.user_id,
                content: fallbackQuery.data.content,
                created_at: fallbackQuery.data.created_at,
                username: fallbackQuery.data.profiles?.username || null,
                first_name: fallbackQuery.data.profiles?.first_name || null,
                last_name: fallbackQuery.data.profiles?.last_name || null,
                avatar_url: fallbackQuery.data.profiles?.avatar_url || null,
              };
  
              console.log('Processed message with fallback query:', newMsg);
              setMessages((prev) => [...prev, newMsg]);
              
              // Scroll to bottom on new message
              setTimeout(() => {
                scrollToBottom();
              }, 100);
              
              return;
            }

            console.log('Complete message data with profile:', data);
            
            // Format the message to match our ChatMessage type
            const newMsg: ChatMessage = {
              id: data.id,
              user_id: data.user_id,
              content: data.content,
              created_at: data.created_at,
              username: data.profiles?.username || null,
              first_name: data.profiles?.first_name || null,
              last_name: data.profiles?.last_name || null,
              avatar_url: data.profiles?.avatar_url || null,
            };

            console.log('Processed message:', newMsg);
            setMessages((prev) => [...prev, newMsg]);
            
            // Scroll to bottom on new message
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          } catch (error) {
            console.error('Error processing new message:', error);
            
            // As a last resort, fetch user profile separately
            try {
              const userProfile = await supabase
                .from('profiles')
                .select('username, first_name, last_name, avatar_url')
                .eq('id', payload.new.user_id)
                .single();
                
              console.log('Separately fetched user profile:', userProfile);
              
              const backupMsg: ChatMessage = {
                id: payload.new.id,
                user_id: payload.new.user_id,
                content: payload.new.content,
                created_at: payload.new.created_at,
                username: userProfile.data?.username || null,
                first_name: userProfile.data?.first_name || null,
                last_name: userProfile.data?.last_name || null,
                avatar_url: userProfile.data?.avatar_url || null,
              };
              
              setMessages((prev) => [...prev, backupMsg]);
            } catch (profileError) {
              console.error('Failed to fetch profile separately:', profileError);
              
              // Final fallback - add message with minimal information
              const basicMsg: ChatMessage = {
                id: payload.new.id,
                user_id: payload.new.user_id,
                content: payload.new.content,
                created_at: payload.new.created_at,
                // Don't hardcode "Unknown User" here - ChatMessage component will handle fallbacks
                username: null,
                first_name: null,
                last_name: null,
                avatar_url: null,
              };
              
              setMessages((prev) => [...prev, basicMsg]);
              toast.error('Error loading user information');
            }
            
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
