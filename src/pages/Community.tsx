
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import ChatMessage from "@/components/community/ChatMessage";
import ChatInput from "@/components/community/ChatInput";
import { useCommunityChat } from "@/hooks/useCommunityChat";
import { toast } from "sonner";
import { users } from "lucide-react";

const Community: React.FC = () => {
  const { user } = useAuth();
  const { 
    messages, 
    loading, 
    newMessage, 
    setNewMessage, 
    sendMessage,
    scrollRef
  } = useCommunityChat();
  
  // If user is not logged in, show a message
  const handleSend = () => {
    if (!user) {
      toast.error("Please sign in to join the conversation");
      return;
    }
    sendMessage();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">M.U.S.E. Community</h1>
          <p className="text-white/70">
            Connect with fellow musicians, share insights, and celebrate your musical journey together.
          </p>
        </header>
        
        {/* Chat Container */}
        <div className="rounded-xl border border-white/10 bg-card/50 mb-6 overflow-hidden flex flex-col h-[calc(100vh-220px)]">
          {/* Chat Header */}
          <div className="p-3 border-b border-white/10 bg-card/80 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <users className="h-5 w-5 text-music-primary" />
              <h2 className="font-medium">Global Chat</h2>
            </div>
            <div className="text-xs text-white/50">
              Be kind and supportive to fellow musicians
            </div>
          </div>
          
          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin"
          >
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-pulse text-white/50">Loading messages...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full text-center p-6">
                <users className="h-12 w-12 text-white/20 mb-2" />
                <h3 className="text-lg font-medium mb-2">Welcome to the community!</h3>
                <p className="text-white/50 mb-4">
                  Be the first to start a conversation with fellow musicians.
                </p>
                {!user && (
                  <p className="text-white/70 text-sm">
                    Sign in to join the conversation
                  </p>
                )}
              </div>
            ) : (
              messages.map((message) => (
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
        
        {/* Instructions and Guidelines */}
        <div className="rounded-lg bg-white/5 p-4 border border-white/10 text-sm text-white/70">
          <h3 className="font-medium text-white mb-2">Community Guidelines</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Be respectful and supportive of other musicians</li>
            <li>Share your progress, challenges, and victories</li>
            <li>Ask questions and offer helpful advice</li>
            <li>Keep conversations appropriate for all age groups</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Community;
