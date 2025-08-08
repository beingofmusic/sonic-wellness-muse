import React, { useEffect, useMemo, useState } from "react";
import { useComments, useDeleteComment, useToggleLike } from "@/hooks/useRoutineFeedback";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface CommentsListProps {
  routineId: string;
}

interface Profile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

const CommentsList: React.FC<CommentsListProps> = ({ routineId }) => {
  const { data: comments, isLoading } = useComments(routineId, 20);
  const del = useDeleteComment(routineId);
  const toggleLike = useToggleLike(routineId);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      setCurrentUserId(auth?.user?.id ?? null);
      const ids = Array.from(new Set((comments || []).map((c) => c.user_id)));
      if (ids.length === 0) return;
      const { data } = await supabase
        .from("profiles")
        .select("id, username, first_name, last_name, avatar_url")
        .in("id", ids);
      const map: Record<string, Profile> = {};
      (data || []).forEach((p: any) => (map[p.id] = p));
      setProfiles(map);
    };
    load();
  }, [comments]);

  if (isLoading) return null;
  if (!comments || comments.length === 0) return null;

  return (
    <section className="w-full max-w-2xl mx-auto mt-6">
      <h3 className="text-base font-semibold mb-3">Recent comments</h3>
      <ul className="space-y-3">
        {comments.map((c) => {
          const p = profiles[c.user_id];
          const name = p?.username || [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "User";
          const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");
          const timeAgo = formatDistanceToNow(new Date(c.created_at), { addSuffix: true });
          const isOwn = currentUserId === c.user_id;
          return (
            <li key={c.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={p?.avatar_url || undefined} alt={`${name} avatar`} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{name}</span>
                    <span className="text-muted-foreground">• {timeAgo}</span>
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{c.comment}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => toggleLike.mutate(c.id)}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {c.likes || 0}
                    </Button>
                    {isOwn && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-destructive"
                        onClick={() => del.mutate(c.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CommentsList;
