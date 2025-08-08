import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChannelChat } from '@/hooks/useChannelChat';
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

  const handleSend = async (opts?: { files?: File[] }) => {
    if (!user) {
      toast.error("Please sign in to join the conversation");
      return;
    }
    await sendMessage(opts?.files);
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
          messageElement.classList.add('bg-music-primary/20', 'border-music-primary/50');
          setTimeout(() => {
            messageElement.classList.remove('bg-music-primary/20', 'border-music-primary/50');
          }, 2000);
          
          // Call the callback to clear the target
          onMessageFound?.();
        }
      }
    }
  }, [targetMessageId, messages, onMessageFound]);

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
          messages.map(message => (
            <div 
              key={message.id} 
              id={`message-${message.id}`}
              className="transition-all duration-500 rounded-lg"
            >
              <ChatMessage 
                message={message} 
                reactions={getForMessage(message.id)} 
                onToggleReaction={(e) => toggle(message.id, e)}
                onEdit={async (newContent) => {
                  const { error } = await (supabase as any).from('community_messages').update({ content: newContent }).eq('id', message.id);
                  if (error) toast.error('Failed to edit message');
                }}
                onDelete={async () => {
                  const { error } = await (supabase as any)
                    .from('community_messages')
                    .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id })
                    .eq('id', message.id);
                  if (error) toast.error('Failed to delete message');
                }}
              />
            </div>
          ))
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
      />
    </div>
  );
};

export default ChannelChatView;