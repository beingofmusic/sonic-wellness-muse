import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConversationChat } from '@/hooks/useConversationChat';
import { ChatMessage as PublicChatMessage } from '@/hooks/useCommunityChat';
import ChatMessage from '@/components/community/ChatMessage';
import ChatInput from '@/components/community/ChatInput';
import { useAuth } from '@/context/AuthContext';

interface ConversationHeaderProps {
  title: string;
  imageUrl?: string | null;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ title, imageUrl }) => (
  <div className="p-4 border-b border-white/10 bg-card/80 backdrop-blur-sm flex items-center gap-3">
    <Avatar className="h-8 w-8">
      {imageUrl ? <AvatarImage src={imageUrl} alt={title} /> : <AvatarFallback className="bg-music-primary/20 text-music-primary">GM</AvatarFallback>}
    </Avatar>
    <h2 className="font-semibold text-lg">{title}</h2>
  </div>
);

interface ConversationChatViewProps {
  conversationId: string;
  title: string;
  imageUrl?: string | null;
}

const ConversationChatView: React.FC<ConversationChatViewProps> = ({ conversationId, title, imageUrl }) => {
  const { user } = useAuth();
  const { messages, loading, newMessage, setNewMessage, sendMessage, scrollRef, typingUsers, setTyping, newMessages, clearNewMessages, handleScroll } = useConversationChat(conversationId);

  const mapped: PublicChatMessage[] = messages.map(m => ({
    id: m.id,
    user_id: m.user_id,
    content: m.content,
    created_at: m.created_at,
    username: m.username,
    first_name: m.first_name,
    last_name: m.last_name,
    avatar_url: m.avatar_url,
  }));

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader title={title} imageUrl={imageUrl} />
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-white/50">Loading messages...</div>
          </div>
        ) : mapped.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-center p-6">
            <h3 className="text-lg font-medium mb-2">Say hello 👋</h3>
            <p className="text-white/50">Start the conversation</p>
          </div>
        ) : (
          mapped.map(message => (
            <div key={message.id} id={`message-${message.id}`} className="transition-all duration-500 rounded-lg">
              <ChatMessage message={message} />
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
        {typingUsers.length > 0 && (
          <div className="px-3 py-1 text-xs text-white/60">Someone is typing…</div>
        )}
      </div>
      <ChatInput 
        value={newMessage}
        onChange={(v) => { setNewMessage(v); setTyping(); }}
        onSubmit={sendMessage}
        disabled={!user}
      />
    </div>
  );
};

export default ConversationChatView;
