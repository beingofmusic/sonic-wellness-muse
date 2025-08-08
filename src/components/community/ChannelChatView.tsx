import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChannelChat, ChannelMessage } from '@/hooks/useChannelChat';
import { CommunityChannel } from '@/hooks/useCommunityChannels';
import ChatMessage from '@/components/community/ChatMessage';
import ChatInput from '@/components/community/ChatInput';
import { toast } from 'sonner';
import { Hash, Users } from 'lucide-react';
import { useReactions } from '@/hooks/useReactions';
import { supabase } from '@/integrations/supabase/client';

interface ChannelChatViewProps {
  channel: CommunityChannel | null;
  targetMessageId?: string | null;
  onMessageFound?: () => void;
}

const ChannelChatView: React.FC<ChannelChatViewProps> = ({ 
  channel, 
  targetMessageId, 
  onMessageFound 
}) => {
  const { user } = useAuth();
  const {
    messages,
    loading,
    newMessage,
    setNewMessage,
    sendMessage,
    scrollRef,
    newMessages,
    clearNewMessages,
    handleScroll
  } = useChannelChat(channel?.id || null);

  const { getForMessage, toggle } = useReactions('community', channel?.id || null, user?.id);
  const [replyTo, setReplyTo] = useState<ChannelMessage | null>(null);

  const handleSend = async (opts?: { files?: File[] }) => {
    if (!user) {
      toast.error("Please sign in to join the conversation");
      return;
    }
    await sendMessage({ files: opts?.files, replyToId: replyTo?.id || null });
    setReplyTo(null);
  };

  // Scroll to target message when it's found
  useEffect(() => {
    if (targetMessageId && messages.length > 0) {
      const targetMessage = messages.find(msg => msg.id === targetMessageId);
      if (targetMessage) {
        // Scroll to the message
        const messageElement = document.getElementById(`message-${targetMessageId}`);
        if (messageElement) {
          messageElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Highlight the message briefly
          messageElement.classList.add('ring-2', 'ring-primary/60', 'rounded-md', 'bg-muted/30');
          setTimeout(() => {
            messageElement.classList.remove('ring-2', 'ring-primary/60', 'rounded-md', 'bg-muted/30');
          }, 2000);
          
          // Call the callback to clear the target
          onMessageFound?.();
        }
      }
    }
  }, [targetMessageId, messages, onMessageFound]);

  // Local helper to scroll/highlight a message (used by "View full message")
  const handleViewOriginal = (id: string) => {
    const el = document.getElementById(`message-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('ring-2', 'ring-primary/60', 'rounded-md', 'bg-muted/30');
    setTimeout(() => {
      el.classList.remove('ring-2', 'ring-primary/60', 'rounded-md', 'bg-muted/30');
    }, 2000);
  };

  const messageById = useMemo(() => {
    const map = new Map<string, ChannelMessage>();
    for (const m of messages) map.set(m.id, m);
    return map;
  }, [messages]);

  const messagesSorted = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages]);

  const makeReplyPreview = (m: ChannelMessage) => {
    const originalId = (m as any).reply_to_id as string | null | undefined;
    if (!originalId) return undefined;
    const original = messageById.get(originalId);
    if (!original) return undefined;
    const authorName = getAuthorName(original);
    const firstLine = original.content.split('\n')[0] || '';
    const preview = firstLine.length > 140 ? firstLine.slice(0, 139) + '…' : firstLine;
    return { id: original.id, authorName, preview };
  };

  if (!channel) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-6">
        <Users className="h-16 w-16 text-white/20 mb-4" />
        <h3 className="text-xl font-medium mb-2">Welcome to M.U.S.E. Community</h3>
        <p className="text-white/70">
          Select a channel from the sidebar to start chatting with fellow musicians
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="p-4 border-b border-white/10 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <Hash className="h-5 w-5 text-music-primary" />
          <h2 className="font-semibold text-lg">{channel.name}</h2>
        </div>
        {channel.description && (
          <p className="text-sm text-white/70">{channel.description}</p>
        )}
      </div>
      
      {/* Messages Area */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-white/50">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-center p-6">
            <Hash className="h-12 w-12 text-white/20 mb-2" />
            <h3 className="text-lg font-medium mb-2">Start the conversation!</h3>
            <p className="text-white/50 mb-4">
              Be the first to post in #{channel.name.replace(/^[^\s]*\s/, '')}
            </p>
            {!user && (
              <p className="text-white/70 text-sm">
                Sign in to join the conversation
              </p>
            )}
          </div>
        ) : (
          <>
            {messagesSorted.map((m) => (
              <ChatMessage
                key={m.id}
                message={m as any}
                reactions={getForMessage(m.id)}
                onToggleReaction={(e) => toggle(m.id, e)}
                onEdit={async (newContent) => {
                  const { error } = await (supabase as any)
                    .from('community_messages')
                    .update({ content: newContent })
                    .eq('id', m.id);
                  if (error) toast.error('Failed to edit message');
                }}
                onDelete={async () => {
                  const { error } = await (supabase as any)
                    .from('community_messages')
                    .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id })
                    .eq('id', m.id);
                  if (error) toast.error('Failed to delete message');
                }}
                onReply={() => setReplyTo(m)}
                replyPreview={makeReplyPreview(m)}
                onViewOriginal={handleViewOriginal}
              />
            ))}
          </>
        )}
        {newMessages > 0 && (
          <div className="sticky bottom-2 flex justify-center">
            <button onClick={clearNewMessages} className="px-3 py-1 rounded-full bg-music-primary/20 text-music-primary border border-music-primary/40 text-xs">
              {newMessages} new message{newMessages > 1 ? 's' : ''} — Jump to latest
            </button>
          </div>
        )}
      </div>
      
      {/* Chat Input */}
      <ChatInput 
        value={newMessage} 
        onChange={setNewMessage} 
        onSubmit={handleSend} 
        disabled={!user}
        replyingTo={replyTo ? { id: replyTo.id, authorName: getAuthorName(replyTo), preview: replyTo.content } : undefined}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
};

export default ChannelChatView;

// Helper to format author name consistently with ChatMessage
function getAuthorName(message: ChannelMessage): string {
  if (message.first_name) {
    return `${message.first_name}${message.last_name ? ` ${message.last_name}` : ''}`;
  }
  if (message.username) return message.username;
  return 'User';
}

// Threaded renderer component to keep ChannelChatView tidy
const ThreadedMessages: React.FC<{
  messages: ChannelMessage[];
  getReactions: (messageId: string) => any;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onEdit: (id: string, content: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onReply: (m: ChannelMessage) => void;
}> = ({ messages, getReactions, onToggleReaction, onEdit, onDelete, onReply }) => {
  const tree = useMemo(() => {
    const map = new Map<string | null, ChannelMessage[]>();
    for (const m of messages) {
      const key = (m as any).reply_to_id || null;
      const arr = map.get(key) || [];
      arr.push(m);
      map.set(key, arr);
    }
    // sort each level by created_at
    for (const arr of map.values()) {
      arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    return map;
  }, [messages]);

  const renderLevel = (parentId: string | null, depth = 0) => {
    const items = tree.get(parentId) || [];
    return items.map((m) => (
      <div key={m.id} id={`message-${m.id}`} className="transition-all duration-500 rounded-lg">
        <ChatMessage
          message={m as any}
          reactions={getReactions(m.id)}
          onToggleReaction={(e) => onToggleReaction(m.id, e)}
          onEdit={(newContent) => onEdit(m.id, newContent)}
          onDelete={() => onDelete(m.id)}
          onReply={() => onReply(m)}
        />
        {tree.get(m.id) && tree.get(m.id)!.length > 0 && (
          <div className="ml-8 pl-3 border-l border-white/10">
            {renderLevel(m.id, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return <>{renderLevel(null)}</>;
};