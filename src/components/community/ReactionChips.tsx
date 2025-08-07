import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MessageReactions, ReactionUser } from "@/hooks/useReactions";

interface ReactionChipsProps {
  reactions?: MessageReactions;
  onToggle: (emoji: string) => void;
}

const nameOf = (u: ReactionUser) =>
  (u.first_name || u.last_name) ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() : (u.username ?? 'User');

export const ReactionChips: React.FC<ReactionChipsProps> = ({ reactions, onToggle }) => {
  if (!reactions || Object.keys(reactions).length === 0) return null;
  const entries = Object.entries(reactions).sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {entries.map(([emoji, meta]) => (
        <div key={emoji} className={`inline-flex items-center rounded-full border px-1.5 h-7 text-xs select-none ${meta.reactedByMe ? 'border-music-primary/60 bg-music-primary/15 text-music-primary' : 'border-white/10 bg-white/5 text-white/80'}`}>
          <button
            type="button"
            aria-pressed={meta.reactedByMe}
            aria-label={`Add ${emoji} reaction`}
            className="px-1 focus:outline-none"
            onClick={() => onToggle(emoji)}
          >
            {emoji}
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="px-1 hover:underline">
                {meta.count}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 bg-card border-white/10">
              <div className="text-xs text-white/70 mb-2">{emoji} by</div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {meta.users.map((u) => (
                  <div key={u.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      {u.avatar_url ? (
                        <AvatarImage src={u.avatar_url} alt={nameOf(u)} />
                      ) : (
                        <AvatarFallback className="text-[10px] bg-white/10">{(nameOf(u)[0] || '?').toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="text-sm text-white/90 truncate">{nameOf(u)}</div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ))}
    </div>
  );
};

export default ReactionChips;
