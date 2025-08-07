
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useCommunityChannels } from "@/hooks/useCommunityChannels";
import ChannelList, { SidebarConversationItem } from "@/components/community/ChannelList";
import ChannelChatView from "@/components/community/ChannelChatView";
import ConversationChatView from "@/components/community/ConversationChatView";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useConversations } from "@/hooks/useConversations";
import { ensureDirectConversation } from "@/services/conversationService";

const Community: React.FC = () => {
  const { user } = useAuth();
  const { channels, loading: channelsLoading } = useCommunityChannels();
  const isMobile = useIsMobile();
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [searchParams] = useSearchParams();
  const [targetMessageId, setTargetMessageId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { dms, groups, loading: convLoading } = useConversations();

  // Handle URL parameters for deep-linking
  useEffect(() => {
    if (channels.length > 0) {
      const channelParam = searchParams.get('channel');
      const messageParam = searchParams.get('message');
      
      if (channelParam) {
        // Find channel by slug
        const targetChannel = channels.find(ch => ch.slug === channelParam);
        if (targetChannel) {
          setActiveChannelId(targetChannel.id);
          if (messageParam) {
            setTargetMessageId(messageParam);
          }
          return;
        }
      }
      
      // Default to "General Chat" channel if no specific channel requested
      if (!activeChannelId) {
        const generalChat = channels.find(ch => ch.slug === 'general-chat');
        setActiveChannelId(generalChat?.id || channels[0].id);
      }
    }
  }, [channels, searchParams, activeChannelId]);

  // Close sidebar on mobile when channel is selected
  const handleChannelSelect = (channelId: string) => {
    setActiveChannelId(channelId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const activeChannel = channels.find(ch => ch.id === activeChannelId) || null;
  const activeConversation = [...dms, ...groups].find(c => c.id === activeConversationId) || null;
  return (
    <Layout>
      <div className="flex h-[calc(100vh-80px)] max-w-7xl mx-auto">
        {/* Mobile Header */}
        {isMobile && (
          <div className="fixed top-20 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">M.U.S.E. Community</h1>
                <p className="text-sm text-white/70">
                  {activeConversationId
                    ? (activeConversation?.name || `${activeConversation?.other_participant?.first_name || ''} ${activeConversation?.other_participant?.last_name || ''}`.trim() || activeConversation?.other_participant?.username || 'Direct Message')
                    : (activeChannel ? `#${activeChannel.name}` : 'Select a chat')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white/70 hover:text-white"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'relative'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          w-64 bg-card/50 border-r border-white/10 transition-transform duration-300 ease-in-out
          ${isMobile ? 'top-32' : 'top-0'}
        `}>
          {isMobile && sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30" 
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div className="relative z-40 h-full bg-card/50 p-4">
            {!isMobile && (
              <header className="mb-6">
                <h1 className="text-xl font-bold mb-1">M.U.S.E. Community</h1>
                <p className="text-sm text-white/70">Musicians United in Striving for Excellence</p>
              </header>
            )}
            
            <ChannelList
              channels={channels}
              activeChannelId={activeChannelId}
              onChannelSelect={handleChannelSelect}
              loading={channelsLoading}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col ${isMobile ? 'mt-32' : ''}`}>
          {/* Chat Container */}
          <div className="flex-1 border border-white/10 bg-card/50 overflow-hidden">
            <ChannelChatView 
              channel={activeChannel} 
              targetMessageId={targetMessageId}
              onMessageFound={() => setTargetMessageId(null)}
            />
          </div>
        </div>
      </div>

      {/* Community Guidelines - Fixed at bottom */}
      <div className="max-w-7xl mx-auto mt-4 p-4">
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
