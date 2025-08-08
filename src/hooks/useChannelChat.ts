import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type MessageAttachment = {
  id: string;
  message_id: string;
  path: string;
  mime_type: string | null;
  size: number | null;
  created_at: string;
  bucket_id?: string | null;
};

export type ChannelMessage = {
  id: string;
  user_id: string;
  channel_id: string;
  content: string;
  created_at: string;
  edited_at?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  pending?: boolean;
  error?: boolean;
  attachments?: MessageAttachment[];
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

  const attachForMessages = async (messageIds: string[]) => {
    if (messageIds.length === 0) return {} as Record<string, MessageAttachment[]>;
    const { data, error } = await (supabase as any)
      .from('community_message_attachments')
      .select('id, message_id, path, mime_type, size, created_at, bucket_id')
      .in('message_id', messageIds);
    if (error) {
      console.error('Failed loading attachments', error);
      return {} as Record<string, MessageAttachment[]>;
    }
    const map: Record<string, MessageAttachment[]> = {};
    for (const att of (data || []) as any[]) {
      if (!map[att.message_id]) map[att.message_id] = [];
      map[att.message_id].push(att as MessageAttachment);
    }
    return map;
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
        const { data, error } = await supabase
          .from('community_messages')
          .select(`
            id,
            content,
            created_at,
            edited_at,
            deleted_at,
            deleted_by,
            user_id,
            channel_id,
            profiles!community_messages_user_id_fkey(
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

        const formattedMessages = (data || []).map((msg: any) => {
          const profileData = msg.profiles || null;
          return {
            id: msg.id,
            user_id: msg.user_id,
            channel_id: msg.channel_id,
            content: msg.content,
            created_at: msg.created_at,
            edited_at: msg.edited_at || null,
            deleted_at: msg.deleted_at || null,
            deleted_by: msg.deleted_by || null,
            username: profileData?.username || null,
            first_name: profileData?.first_name || null,
            last_name: profileData?.last_name || null,
            avatar_url: profileData?.avatar_url || null,
            attachments: [],
          } as ChannelMessage;
        });

        // Load attachments for these messages
        const ids = formattedMessages.map(m => m.id);
        const attMap = await attachForMessages(ids);
        const withAtts = formattedMessages.map(m => ({ ...m, attachments: attMap[m.id] || [] }));

        setMessages(withAtts);
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
              edited_at: (payload.new as any).edited_at || null,
              deleted_at: (payload.new as any).deleted_at || null,
              deleted_by: (payload.new as any).deleted_by || null,
              username: profileData?.username || null,
              first_name: profileData?.first_name || null,
              last_name: profileData?.last_name || null,
              avatar_url: profileData?.avatar_url || null,
              attachments: [],
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
          setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, content: m.content, created_at: m.created_at, edited_at: m.edited_at || null, deleted_at: m.deleted_at || null, deleted_by: m.deleted_by || null } : msg));
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
      // Listen for new attachments and merge into messages we already have
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_message_attachments' },
        (payload) => {
          const att = payload.new as any as MessageAttachment;
          setMessages(prev => prev.map(m => m.id === att.message_id ? { ...m, attachments: [...(m.attachments || []), att] } : m));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const uploadAttachments = async (messageId: string, files?: File[]) => {
    if (!user || !files || files.length === 0) return;
    for (const file of files) {
      const path = `${user.id}/${messageId}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from('chat_attachments')
        .upload(path, file);
      if (uploadErr) {
        console.error('Upload failed', uploadErr);
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }
      const { error: insertErr } = await (supabase as any)
        .from('community_message_attachments')
        .insert({ message_id: messageId, path, mime_type: file.type, size: file.size, uploaded_by: user.id });
      if (insertErr) {
        console.error('Insert attachment failed', insertErr);
      }
    }
  };

  // Function to send a new message (supports attachments)
  const sendMessage = async (files?: File[]) => {
    if (!user || !channelId) return;
    const content = newMessage.trim();
    if (!content && (!files || files.length === 0)) return;

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
        content: content,
        created_at: nowIso,
        pending: true,
        username: profile?.username || null,
        first_name: profile?.first_name || null,
        last_name: profile?.last_name || null,
        avatar_url: profile?.avatar_url || null,
        attachments: [],
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

      // Upload attachments after message is created
      await uploadAttachments(inserted.id, files);

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
