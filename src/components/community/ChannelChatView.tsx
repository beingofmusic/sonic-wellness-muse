import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChannelChat } from '@/hooks/useChannelChat';
import { CommunityChannel } from '@/hooks/useCommunityChannels';
import ChatMessage from '@/components/community/ChatMessage';
import ChatInput from '@/components/community/ChatInput';
import { toast } from 'sonner';
import { Hash, Users } from 'lucide-react';

interface ChannelChatViewProps {
  channel: CommunityChannel | null;
}

const ChannelChatView: React.FC<ChannelChatViewProps> = ({ channel }) => {
  const { user } = useAuth();
  const {
    messages,
    loading,
    newMessage,
    setNewMessage,
    sendMessage,
    scrollRef
  } = useChannelChat(channel?.id || null);

  const handleSend = () => {
    if (!user) {
      toast.error("Please sign in to join the conversation");
      return;
    }
    sendMessage();
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
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
            <ChatMessage key={message.id} message={message} />
          ))
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