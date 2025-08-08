import React, { useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChatMessage as ChatMessageType } from "@/hooks/useCommunityChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ClickableUserProfile from "@/components/ClickableUserProfile";
import { ReactionChips } from "./ReactionChips";
import ReactionPicker from "./ReactionPicker";
import type { MessageReactions } from "@/hooks/useReactions";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ChatMessageProps {
  message: (ChatMessageType & { pending?: boolean; error?: boolean; attachments?: { id: string; path: string; mime_type?: string | null; size?: number | null; message_id?: string }[] });
  reactions?: MessageReactions;
  onToggleReaction?: (emoji: string) => void;
}

const ImagePreview: React.FC<{ url: string; alt: string }> = ({ url, alt }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block overflow-hidden rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
        aria-label={`Open image ${alt}`}
      >
        <img src={url} alt={alt} loading="lazy" className="max-h-40 object-cover" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 border-0 bg-transparent max-w-[90vw]">
          <img src={url} alt={alt} className="w-full h-auto rounded-md" />
        </DialogContent>
      </Dialog>
    </>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, reactions, onToggleReaction }) => {
  const [hover, setHover] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const longPressTimer = useRef<number | null>(null);

  const formattedTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  
  const getFullName = () => {
    if (message.first_name) {
      const lastName = message.last_name ? ` ${message.last_name}` : '';
      return `${message.first_name}${lastName}`;
    }
    if (message.username) return message.username;
    if (message.user_id) return "User";
    return "Anonymous User";
  };

  const getInitials = () => {
    if (message.first_name) {
      const firstInitial = message.first_name.charAt(0).toUpperCase();
      const lastInitial = message.last_name ? message.last_name.charAt(0).toUpperCase() : '';
      return `${firstInitial}${lastInitial}`;
    }
    if (message.username) return message.username.charAt(0).toUpperCase();
    if (message.user_id) return "U";
    return "?";
  };

  if (!message.first_name && !message.username && message.user_id) {
    console.log('Message with missing profile data:', message);
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => setPickerOpen(true), 450);
  };
  const handlePointerUp = () => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
  };

  const defaultEmojis = ["👍","❤️","😂","🎶","🙌"];

  return (
    <div
      className="p-3 hover:bg-white/5 transition-colors relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8">
          {message.avatar_url ? (
            <AvatarImage 
              src={message.avatar_url} 
              alt={getFullName()} 
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="bg-music-primary/20 text-music-primary text-sm">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline mb-1">
            <ClickableUserProfile
              userId={message.user_id}
              username={message.username}
              firstName={message.first_name}
              lastName={message.last_name}
              avatarUrl={message.avatar_url}
              className="font-medium text-white mr-2 truncate"
              openDmOnClick
            />
            <span className="text-xs text-white/50">{formattedTime}</span>
          </div>
          <p className="text-sm text-white/90 break-words">{message.content}</p>
          {/* Attachments */}
          {Array.isArray((message as any).attachments) && (message as any).attachments.length > 0 && (
            <div className="mt-2 flex flex-col gap-2">
              {(message as any).attachments.map((att: any) => {
                const url = supabase.storage.from('chat_attachments').getPublicUrl(att.path).data.publicUrl;
                const isImage = (att.mime_type || '').startsWith('image/');
                const isPdf = (att.mime_type || '') === 'application/pdf';
                return (
                  <div key={att.id} className="max-w-[320px]">
                    {isImage ? (
                      <ImagePreview url={url} alt={att.path.split('/').pop() || 'image attachment'} />
                    ) : isPdf ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="block border border-white/10 rounded-md p-3 bg-white/5 hover:bg-white/10">
                        <div className="text-sm font-medium truncate">{att.path.split('/').pop()}</div>
                        <div className="text-xs text-white/60">PDF • {Math.round((att.size || 0)/1024)} KB</div>
                      </a>
                    ) : (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm underline">{att.path.split('/').pop()}</a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {message.pending && (
            <div className="text-xs text-white/50 mt-1">Sending…</div>
          )}
          {message.error && (
            <div className="text-xs text-destructive mt-1">Failed to send</div>
          )}

          {/* Reactions (chips) */}
          <ReactionChips reactions={reactions} onToggle={(e) => onToggleReaction?.(e)} />
        </div>
      </div>

      {/* Hover reaction bar (desktop) */}
      {hover && (
        <div className="absolute -top-2 left-12 flex items-center gap-1 bg-card/80 backdrop-blur-sm border border-white/10 rounded-full px-1 py-0.5 shadow-sm">
          {defaultEmojis.map((e) => (
            <button
              key={e}
              type="button"
              aria-label={`Add ${e} reaction`}
              className="h-7 w-7 rounded-full text-sm hover:bg-white/10"
              onClick={() => onToggleReaction?.(e)}
            >
              {e}
            </button>
          ))}
          <ReactionPicker onPick={(e) => { setPickerOpen(false); onToggleReaction?.(e); }} />
        </div>
      )}

      {/* Long-press picker (mobile) */}
      {pickerOpen && (
        <div className="mt-2 ml-12">
          <ReactionPicker onPick={(e) => { setPickerOpen(false); onToggleReaction?.(e); }} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;