import React from 'react';
import { CommunityChannel } from '@/hooks/useCommunityChannels';
import { Button } from '@/components/ui/button';
import { Hash, MessageCircle, Users } from 'lucide-react';

export interface SidebarConversationItem {
  id: string;
  title: string;
  avatarUrl?: string | null;
  unread?: number;
}

interface ChannelListProps {
  channels: CommunityChannel[];
  activeChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
  loading: boolean;

  dms?: SidebarConversationItem[];
  groups?: SidebarConversationItem[];
  activeConversationId?: string | null;
  onConversationSelect?: (conversationId: string) => void;
  onNewDM?: () => void;
  onNewGroup?: () => void;
}

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <div className="text-xs font-semibold text-white/70 uppercase tracking-wider px-2 mb-2">{label}</div>
);

const ChannelList: React.FC<ChannelListProps> = ({ 
  channels, 
  activeChannelId, 
  onChannelSelect, 
  loading,
  dms = [],
  groups = [],
  activeConversationId = null,
  onConversationSelect,
  onNewDM,
  onNewGroup,
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <SectionHeader label="Channels" />
        {channels.map((channel) => (
          <Button
            key={channel.id}
            variant="ghost"
            size="sm"
            onClick={() => onChannelSelect(channel.id)}
            className={`w-full justify-start h-8 px-2 text-sm font-normal transition-colors ${
              activeChannelId === channel.id
                ? 'bg-music-primary/20 text-music-primary hover:bg-music-primary/30'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Hash className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate text-left">{channel.name}</span>
          </Button>
        ))}
      </div>

      <div>
        <SectionHeader label="Direct Messages" />
        {dms.length === 0 ? (
          <div className="px-2">
            <div className="flex items-center justify-between h-8 text-sm text-white/60">
              <span>No direct messages yet</span>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onNewDM}>
                <MessageCircle className="w-4 h-4 mr-1" /> New DM
              </Button>
            </div>
          </div>
        ) : (
          dms.map((dm) => (
            <Button
              key={dm.id}
              variant="ghost"
              size="sm"
              onClick={() => onConversationSelect && onConversationSelect(dm.id)}
              className={`w-full justify-start h-8 px-2 text-sm font-normal transition-colors ${
                activeConversationId === dm.id
                  ? 'bg-music-secondary/20 text-music-secondary hover:bg-music-secondary/30'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate text-left flex-1">{dm.title}</span>
              {dm.unread && dm.unread > 0 && (
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-music-primary text-background">{dm.unread}</span>
              )}
            </Button>
          ))
        )}
      </div>

      <div>
        <SectionHeader label="Groups" />
        {groups.length === 0 ? (
          <div className="px-2">
            <div className="flex items-center justify-between h-8 text-sm text-white/60">
              <span>No groups yet</span>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onNewGroup}>
                <Users className="w-4 h-4 mr-1" /> New Group
              </Button>
            </div>
          </div>
        ) : (
          groups.map((g) => (
            <Button
              key={g.id}
              variant="ghost"
              size="sm"
              onClick={() => onConversationSelect && onConversationSelect(g.id)}
              className={`w-full justify-start h-8 px-2 text-sm font-normal transition-colors ${
                activeConversationId === g.id
                  ? 'bg-music-tertiary/20 text-music-tertiary hover:bg-music-tertiary/30'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate text-left flex-1">{g.title}</span>
              {g.unread && g.unread > 0 && (
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-music-primary text-background">{g.unread}</span>
              )}
            </Button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChannelList;