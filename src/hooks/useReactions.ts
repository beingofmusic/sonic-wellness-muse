import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ReactionUser = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

export type MessageReactions = Record<
  string, // emoji
  {
    count: number;
    reactedByMe: boolean;
    users: ReactionUser[];
  }
>;

export type ReactionsByMessage = Record<string, MessageReactions>;

type Scope = "community" | "conversation";

const DEFAULTS = ["👍", "❤️", "😂", "🎶", "🙌"];

export const defaultReactions = DEFAULTS;

export function useReactions(scope: Scope, threadId: string | null, currentUserId?: string | null) {
  const [reactionsByMessage, setReactionsByMessage] = useState<ReactionsByMessage>({});
  const table = scope === "community" ? "community_message_reactions" : "conversation_message_reactions";
  const filterCol = scope === "community" ? "channel_id" : "conversation_id";
  const rpcList = scope === "community" ? "list_community_reactions" : "list_conversation_reactions";
  const rpcToggle = scope === "community" ? "add_or_toggle_community_reaction" : "add_or_toggle_conversation_reaction";
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const load = async () => {
    if (!threadId) return;
    const { data, error } = await supabase.rpc(rpcList, scope === "community" ? { p_channel_id: threadId } : { p_conversation_id: threadId });
    if (error) {
      console.error("Failed to load reactions", error);
      return;
    }
    const next: ReactionsByMessage = {};
    for (const r of data as any[]) {
      const msgId = r.message_id as string;
      const emoji = r.emoji as string;
      const user: ReactionUser = {
        id: r.user_id,
        username: r.username ?? null,
        first_name: r.first_name ?? null,
        last_name: r.last_name ?? null,
        avatar_url: r.avatar_url ?? null,
      };
      if (!next[msgId]) next[msgId] = {};
      if (!next[msgId][emoji]) next[msgId][emoji] = { count: 0, reactedByMe: false, users: [] };
      next[msgId][emoji].count += 1;
      next[msgId][emoji].users.push(user);
      if (currentUserId && user.id === currentUserId) next[msgId][emoji].reactedByMe = true;
    }
    setReactionsByMessage(next);
  };

  useEffect(() => {
    load();
    // subscribe to realtime
    if (!threadId) return;
    const ch = supabase
      .channel(`${table}-${threadId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table, filter: `${filterCol}=eq.${threadId}` },
        async (payload) => {
          const r: any = payload.new;
          // fetch user profile of reactor
          const { data: prof } = await supabase
            .from("profiles")
            .select("id, username, first_name, last_name, avatar_url")
            .eq("id", r.user_id)
            .maybeSingle();
          const reactor: ReactionUser = prof ?? {
            id: r.user_id,
            username: null,
            first_name: null,
            last_name: null,
            avatar_url: null,
          };
          setReactionsByMessage((prev) => {
            const copy = { ...prev } as ReactionsByMessage;
            const msgId = r.message_id as string;
            const emoji = r.emoji as string;
            if (!copy[msgId]) copy[msgId] = {};
            if (!copy[msgId][emoji]) copy[msgId][emoji] = { count: 0, reactedByMe: false, users: [] };
            copy[msgId][emoji].count += 1;
            // Avoid inserting duplicates if already present
            if (!copy[msgId][emoji].users.find((u) => u && u.id === reactor.id)) {
              copy[msgId][emoji].users = [...copy[msgId][emoji].users, reactor];
            }
            if (currentUserId && r.user_id === currentUserId) copy[msgId][emoji].reactedByMe = true;
            return copy;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table, filter: `${filterCol}=eq.${threadId}` },
        async (payload) => {
          const oldR: any = payload.old;
          const newR: any = payload.new;
          // same user moved emoji from old to new
          setReactionsByMessage((prev) => {
            const copy = { ...prev } as ReactionsByMessage;
            const msgId = newR.message_id as string;
            if (!copy[msgId]) copy[msgId] = {};
            // decrement old
            if (oldR && copy[msgId][oldR.emoji]) {
              copy[msgId][oldR.emoji].count = Math.max(0, copy[msgId][oldR.emoji].count - 1);
              copy[msgId][oldR.emoji].users = copy[msgId][oldR.emoji].users.filter((u) => u && u.id !== newR.user_id);
              if (currentUserId && newR.user_id === currentUserId && copy[msgId][oldR.emoji].count === 0) {
                copy[msgId][oldR.emoji].reactedByMe = false;
              }
              if (copy[msgId][oldR.emoji].count === 0) delete copy[msgId][oldR.emoji];
            }
            // increment new
            if (!copy[msgId][newR.emoji]) copy[msgId][newR.emoji] = { count: 0, reactedByMe: false, users: [] };
            copy[msgId][newR.emoji].count += 1;
            // We need the user's profile; attempt to find in other lists
            const knownUser = Object.values(copy[msgId]).flatMap((v) => v.users).find((u) => u.id === newR.user_id);
            if (knownUser && !copy[msgId][newR.emoji].users.find((u) => u.id === knownUser.id)) {
              copy[msgId][newR.emoji].users = [...copy[msgId][newR.emoji].users, knownUser];
            }
            if (currentUserId && newR.user_id === currentUserId) copy[msgId][newR.emoji].reactedByMe = true;
            return copy;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table, filter: `${filterCol}=eq.${threadId}` },
        (payload) => {
          const r: any = payload.old;
          setReactionsByMessage((prev) => {
            const copy = { ...prev } as ReactionsByMessage;
            const msgId = r.message_id as string;
            if (!copy[msgId]) return prev;
            if (!copy[msgId][r.emoji]) return prev;
            copy[msgId][r.emoji].count = Math.max(0, copy[msgId][r.emoji].count - 1);
            copy[msgId][r.emoji].users = copy[msgId][r.emoji].users.filter((u) => u && u.id !== r.user_id);
            if (currentUserId && r.user_id === currentUserId && copy[msgId][r.emoji].count === 0) {
              copy[msgId][r.emoji].reactedByMe = false;
            }
            if (copy[msgId][r.emoji].count === 0) delete copy[msgId][r.emoji];
            return copy;
          });
        }
      )
      .subscribe();
    channelRef.current = ch;
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, scope, currentUserId]);

  const getForMessage = (messageId: string): MessageReactions | undefined => reactionsByMessage[messageId];

  const toggle = async (messageId: string, emoji: string) => {
    if (!threadId) return;
    try {
      if (scope === "community") {
        const { error } = await supabase.rpc(rpcToggle, { p_message_id: messageId, p_channel_id: threadId, p_emoji: emoji });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc(rpcToggle, { p_message_id: messageId, p_conversation_id: threadId, p_emoji: emoji });
        if (error) throw error;
      }
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'Failed to react';
      if (msg.toLowerCase().includes('rate limit')) {
        toast.error('Too many reactions. Please wait a moment.');
      } else {
        toast.error('Could not update reaction');
      }
      console.error('toggle reaction error', e);
    }
  };
  return {
    reactionsByMessage,
    getForMessage,
    toggle,
    defaultReactions: DEFAULTS,
    reloadReactions: load,
  };
}
