import React from "react";
import { MessageSquare, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRecentCommunityActivity } from "@/hooks/useRecentCommunityActivity";

const LiveCommunityFeed: React.FC = () => {
  const { recentMessages, activeUsers, loading } = useRecentCommunityActivity();

  const getDisplayName = (msg: typeof recentMessages[0]) => {
    if (msg.first_name && msg.last_name) {
      return `${msg.first_name} ${msg.last_name}`;
    } else if (msg.first_name) {
      return msg.first_name;
    } else if (msg.username) {
      return msg.username;
    }
    return 'Music Lover';
  };

  const getInitials = (msg: typeof recentMessages[0]) => {
    const name = getDisplayName(msg);
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name[0] || 'M';
  };

  const truncateMessage = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleOpenChat = (channelSlug: string, messageId: string) => {
    // Navigate to community chat with specific channel and message
    if (channelSlug) {
      window.location.href = `/community?channel=${channelSlug}&message=${messageId}`;
    } else {
      // Fallback to general community page
      window.location.href = `/community`;
    }
  };

  if (loading) {
    return (
      <section>
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="text-xl font-medium">M.U.S.E. Community Feed</h2>
          <Link to="/community">
            <Button variant="outline" className="text-sm bg-transparent border border-music-primary/30 text-music-primary hover:bg-music-primary/10 mt-2 sm:mt-0">
              <MessageSquare className="h-4 w-4 mr-2" />
              Open Chat
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-card/80 rounded-lg border border-white/10 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-full mb-1"></div>
                  <div className="h-3 bg-white/10 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (recentMessages.length === 0) {
    return (
      <section>
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="text-xl font-medium">M.U.S.E. Community Feed</h2>
          <Link to="/community">
            <Button variant="outline" className="text-sm bg-transparent border border-music-primary/30 text-music-primary hover:bg-music-primary/10 mt-2 sm:mt-0">
              <MessageSquare className="h-4 w-4 mr-2" />
              Open Chat
            </Button>
          </Link>
        </div>
        
        <div className="p-8 bg-card/80 rounded-lg border border-white/10 text-center">
          <MessageSquare className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No recent community activity</h3>
          <p className="text-white/70 mb-4">Be the first to say hello and start a conversation!</p>
          <Link to="/community?channel=general-chat">
            <Button className="bg-music-primary hover:bg-music-secondary text-white">
              Start Chatting
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl font-medium">M.U.S.E. Community Feed</h2>
        <Link to="/community">
          <Button variant="outline" className="text-sm bg-transparent border border-music-primary/30 text-music-primary hover:bg-music-primary/10 mt-2 sm:mt-0">
            <MessageSquare className="h-4 w-4 mr-2" />
            Open Chat
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Messages */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-medium text-white/80 mb-3">Latest Messages</h3>
          {recentMessages.map((message) => (
            <div key={message.id} className="p-4 bg-card/80 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-music-primary/20 flex items-center justify-center flex-shrink-0">
                  {message.avatar_url ? (
                    <img 
                      src={message.avatar_url} 
                      alt={getDisplayName(message)}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-music-primary">
                      {getInitials(message)}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{getDisplayName(message)}</span>
                    <span className="text-xs text-white/50">•</span>
                    <span className="text-xs text-music-primary">#{message.channel_name}</span>
                    <span className="text-xs text-white/50">•</span>
                    <span className="text-xs text-white/50">{message.formatted_time}</span>
                  </div>
                  
                  <p className="text-sm text-white/80 mb-2 break-words">
                    {truncateMessage(message.content)}
                  </p>
                  
                  <button
                    onClick={() => handleOpenChat(message.channel_slug, message.id)}
                    className="inline-flex items-center gap-1 text-xs text-music-primary hover:text-music-light transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open in Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Active Users */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-medium text-white/80 mb-3">Most Active This Week</h3>
          <div className="bg-card/80 rounded-lg border border-white/10 p-4">
            {activeUsers.length > 0 ? (
              <div className="space-y-3">
                {activeUsers.map((user, index) => (
                  <div key={user.user_id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-music-primary/20 text-xs font-medium text-music-primary">
                      {index + 1}
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-music-primary/20 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.first_name || user.username || 'User'}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium text-music-primary">
                          {user.first_name?.[0] || user.username?.[0] || 'M'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.first_name || user.username || 'Music Lover'
                        }
                      </div>
                      <div className="text-xs text-white/50">
                        {user.message_count} message{user.message_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Users className="h-8 w-8 text-white/30 mx-auto mb-2" />
                <p className="text-sm text-white/70">No activity this week</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveCommunityFeed;