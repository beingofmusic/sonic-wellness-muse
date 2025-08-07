import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface ConversationMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
}

export const useConversationChat = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    let isMounted = true;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("conversation_messages")
          .select(`id, content, created_at, user_id`)
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })
          .limit(500);
        if (error) throw error;

        // Load profiles for senders
        const userIds = [...new Set((data || []).map(d => d.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, first_name, last_name, avatar_url")
          .in("id", userIds);
        const profMap: Record<string, any> = {};
        for (const p of profiles || []) profMap[p.id] = p;

        const mapped: ConversationMessage[] = (data || []).map(m => ({
          id: m.id,
          user_id: m.user_id,
          content: m.content,
          created_at: m.created_at,
          username: profMap[m.user_id]?.username || null,
          first_name: profMap[m.user_id]?.first_name || null,
          last_name: profMap[m.user_id]?.last_name || null,
          avatar_url: profMap[m.user_id]?.avatar_url || null,
        }));

        if (!isMounted) return;
        setMessages(mapped);

        // mark as read
        if (user) {
          await supabase
            .from('conversation_participants')
            .update({ last_read_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .eq('user_id', user.id);
        }
      } catch (e) {
        console.error('Failed loading conversation messages', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_messages', filter: `conversation_id=eq.${conversationId}` }, async (payload) => {
        const m = payload.new as any;
        // fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, first_name, last_name, avatar_url')
          .eq('id', m.user_id)
          .single();
        const newMsg: ConversationMessage = {
          id: m.id,
          user_id: m.user_id,
          content: m.content,
          created_at: m.created_at,
          username: profileData?.username || null,
          first_name: profileData?.first_name || null,
          last_name: profileData?.last_name || null,
          avatar_url: profileData?.avatar_url || null,
        };
        setMessages(prev => [...prev, newMsg]);
        // update last_read
        if (user) {
          await supabase
            .from('conversation_participants')
            .update({ last_read_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .eq('user_id', user.id);
        }
        // scroll
        setTimeout(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 100);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_typing', filter: `conversation_id=eq.${conversationId}` }, () => refreshTyping())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversation_typing', filter: `conversation_id=eq.${conversationId}` }, () => refreshTyping())
      .subscribe();

    const refreshTyping = async () => {
      if (!conversationId) return;
      const fiveSecAgo = new Date(Date.now() - 5000).toISOString();
      const { data } = await supabase
        .from('conversation_typing')
        .select('user_id, updated_at')
        .eq('conversation_id', conversationId)
        .gt('updated_at', fiveSecAgo);
      const others = (data || []).map(d => d.user_id).filter(id => id !== user?.id);
      setTypingUsers(others);
    };

    refreshTyping();

    return () => { supabase.removeChannel(channel); isMounted = false; };
  }, [conversationId, user]);

  const sendMessage = async () => {
    if (!user || !conversationId || !newMessage.trim()) return;
    const content = newMessage.trim();
    setNewMessage("");
    await supabase.from('conversation_messages').insert({ conversation_id: conversationId, user_id: user.id, content });
  };

  const setTyping = async () => {
    if (!user || !conversationId) return;
    // avoid too frequent upserts
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    await supabase.from('conversation_typing').upsert({ conversation_id: conversationId, user_id: user.id, is_typing: true, updated_at: new Date().toISOString() });
    typingTimer.current = window.setTimeout(async () => {
      await supabase.from('conversation_typing').update({ is_typing: false, updated_at: new Date().toISOString() }).eq('conversation_id', conversationId).eq('user_id', user.id);
    }, 3000);
  };

  return { messages, loading, newMessage, setNewMessage, sendMessage, scrollRef, typingUsers, setTyping };
};
