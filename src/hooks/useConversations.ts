import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Conversation {
  id: string;
  is_group: boolean;
  name: string | null;
  image_url: string | null;
  is_public: boolean;
  created_by: string;
  last_message_at: string | null;
  unread_count: number;
  other_participant?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [dms, setDms] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        // Fetch conversations the user participates in
        const { data: convs, error } = await supabase
          .from("conversations")
          .select("id,is_group,name,image_url,is_public,created_by,created_at,updated_at")
          .order("updated_at", { ascending: false });

        if (error) throw error;

        // Filter to only those where the user is participant (RLS already restricts)
        const convIds = (convs || []).map(c => c.id);
        if (convIds.length === 0) {
          if (!isMounted) return;
          setDms([]); setGroups([]); setLoading(false); return;
        }

        // Load participants for each conversation for unread calc and DM display
        const { data: parts, error: partsErr } = await supabase
          .from("conversation_participants")
          .select("conversation_id,user_id,last_read_at,muted")
          .in("conversation_id", convIds);
        if (partsErr) throw partsErr;

        // Load last message time per conversation
        const { data: msgs, error: msgsErr } = await supabase
          .from("conversation_messages")
          .select("conversation_id, created_at")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: false });
        if (msgsErr) throw msgsErr;

        const lastByConv: Record<string, string> = {};
        for (const m of msgs || []) {
          if (!lastByConv[m.conversation_id]) lastByConv[m.conversation_id] = m.created_at as string;
        }

        // Unread counts
        const myRows = (parts || []).filter(p => p.user_id === user.id);
        const unreadByConv: Record<string, number> = {};
        for (const convId of convIds) unreadByConv[convId] = 0;
        // Count messages newer than last_read_at
        for (const convId of convIds) {
          const lastRead = myRows.find(r => r.conversation_id === convId)?.last_read_at as string | null | undefined;
          const lastReadTime = lastRead ? new Date(lastRead).getTime() : 0;
          const convMsgs = (msgs || []).filter(m => m.conversation_id === convId);
          unreadByConv[convId] = convMsgs.filter(m => new Date(m.created_at).getTime() > lastReadTime).length;
        }

        // For DMs, fetch other participant profile
        const dmIds = (convs || []).filter(c => !c.is_group).map(c => c.id);
        let otherProfiles: Record<string, any> = {};
        if (dmIds.length > 0) {
          const otherRows = (parts || []).filter(p => dmIds.includes(p.conversation_id) && p.user_id !== user.id);
          const otherUserIds = [...new Set(otherRows.map(r => r.user_id))];
          if (otherUserIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id,first_name,last_name,username,avatar_url")
              .in("id", otherUserIds);
            for (const p of profiles || []) otherProfiles[p.id] = p;
          }
        }

        const mapped: Conversation[] = (convs || []).map(c => ({
          id: c.id,
          is_group: c.is_group,
          name: c.name,
          image_url: c.image_url,
          is_public: c.is_public,
          created_by: c.created_by,
          last_message_at: lastByConv[c.id] || null,
          unread_count: unreadByConv[c.id] || 0,
          other_participant: c.is_group ? null : (() => {
            const row = (parts || []).find(p => p.conversation_id === c.id && p.user_id !== user.id);
            if (!row) return null;
            const prof = otherProfiles[row.user_id] || null;
            return prof ? { id: prof.id, first_name: prof.first_name, last_name: prof.last_name, username: prof.username, avatar_url: prof.avatar_url } : null;
          })()
        }));

        if (!isMounted) return;
        setDms(mapped.filter(m => !m.is_group));
        setGroups(mapped.filter(m => m.is_group));
      } catch (e) {
        console.error("Error loading conversations", e);
        setDms([]); setGroups([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    // Realtime: refresh on new messages or participants
    const channel = supabase
      .channel('conversations-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_messages' }, () => load())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversation_participants' }, () => load())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_participants' }, () => load())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'conversation_participants' }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); isMounted = false; };
  }, [user]);

  return { dms, groups, loading };
};
