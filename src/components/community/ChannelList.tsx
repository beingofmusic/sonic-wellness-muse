import React from 'react';
import { CommunityChannel } from '@/hooks/useCommunityChannels';
import { Button } from '@/components/ui/button';
import { Hash } from 'lucide-react';

interface ChannelListProps {
  channels: CommunityChannel[];
  activeChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
  loading: boolean;
}

const ChannelList: React.FC<ChannelListProps> = ({ 
  channels, 
  activeChannelId, 
  onChannelSelect, 
  loading 
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
    <div className="space-y-1">
      <div className="text-xs font-semibold text-white/70 uppercase tracking-wider px-2 mb-2">
        Channels
      </div>
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
  );
};

export default ChannelList;