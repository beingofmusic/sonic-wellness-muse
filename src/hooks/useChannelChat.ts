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
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  pending?: boolean;
  error?: boolean;
};

export const useChannelChat = (channelId: string | null) => {
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const { user, profile } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newMessages, setNewMessages] = useState(0);

  const isNearBottom = () => {
    const el = scrollRef.current;
    if (!el) return true;
    const threshold = 120;
    return el.scrollHeight - (el.scrollTop + el.clientHeight) < threshold;
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (isNearBottom()) setNewMessages(0);
  };

  const clearNewMessages = () => {
    setNewMessages(0);
    scrollToBottom();
  };

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
        setTimeout(() => scrollToBottom(), 50);
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
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, first_name, last_name, avatar_url')
              .eq('id', payload.new.user_id)
              .single();

            const incoming: ChannelMessage = {
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

            const shouldScroll = isNearBottom();
            setMessages((prev) => {
              if (prev.some((x) => x.id === incoming.id)) return prev;
              const idx = prev.findIndex(
                (x) => x.pending && x.user_id === incoming.user_id && x.content === incoming.content
              );
              if (idx !== -1) {
                const copy = prev.slice();
                copy[idx] = { ...incoming };
                return copy;
              }
              return [...prev, incoming];
            });

            if (shouldScroll) {
              setTimeout(() => scrollToBottom(), 50);
            } else {
              setNewMessages((c) => c + 1);
            }
          } catch (error) {
            console.error('Error handling incoming message', error);
            const incoming: ChannelMessage = {
              id: payload.new.id,
              user_id: payload.new.user_id,
              channel_id: payload.new.channel_id,
              content: payload.new.content,
              created_at: payload.new.created_at,
            };
            const shouldScroll = isNearBottom();
            setMessages((prev) => [...prev, incoming]);
            if (shouldScroll) setTimeout(() => scrollToBottom(), 50); else setNewMessages((c) => c + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          const m = payload.new as any;
          setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, content: m.content, created_at: m.created_at } : msg));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          const m = payload.old as any;
          setMessages(prev => prev.filter(msg => msg.id !== m.id));
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

    const content = newMessage.trim();
    setNewMessage('');

    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    const nowIso = new Date().toISOString();
    setMessages(prev => [
      ...prev,
      {
        id: tempId,
        user_id: user.id,
        channel_id: channelId,
        content,
        created_at: nowIso,
        pending: true,
        username: profile?.username || null,
        first_name: profile?.first_name || null,
        last_name: profile?.last_name || null,
        avatar_url: profile?.avatar_url || null,
      },
    ]);
    setTimeout(() => scrollToBottom(), 0);

    try {
      const { data: inserted, error } = await supabase
        .from('community_messages')
        .insert({
          user_id: user.id,
          channel_id: channelId,
          content,
        })
        .select('id, created_at')
        .single();

      if (error || !inserted) throw error;

      // Update temp message with real id and timestamp; realtime handler will de-dup
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: inserted.id, created_at: inserted.created_at, pending: false } : m));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, pending: false, error: true } : m));
      toast.error('Failed to send message');
    }
  };


  // Intentionally removed automatic scroll on every message change to respect user position
  useEffect(() => {
    // no-op
  }, [messages]);

  return {
    messages,
    loading,
    newMessage,
    setNewMessage,
    sendMessage,
    scrollRef,
    newMessages,
    clearNewMessages,
    handleScroll,
    scrollToBottom,
  };
};