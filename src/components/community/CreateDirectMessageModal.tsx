import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { ensureDirectConversation } from "@/services/conversationService";

interface CreateDirectMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (conversationId: string) => void;
}

interface ProfileItem {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

const displayName = (p: ProfileItem) =>
  (p.first_name || p.last_name)
    ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()
    : (p.username || 'User');

const CreateDirectMessageModal: React.FC<CreateDirectMessageModalProps> = ({ open, onOpenChange, onCreated }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ProfileItem[]>([]);

  useEffect(() => {
    if (!open) { setQuery(""); setResults([]); return; }
    const run = async () => {
      setSearching(true);
      try {
        if (!query.trim()) {
          const { data, error } = await supabase
            .from("profiles")
            .select("id,username,first_name,last_name,avatar_url")
            .neq("id", user?.id ?? "")
            .order("first_name", { ascending: true })
            .limit(50);
          if (error) throw error;
          setResults(((data as any[]) as ProfileItem[]) || []);
        } else {
          const q = `%${query.trim()}%`;
          const { data, error } = await supabase
            .from("profiles")
            .select("id,username,first_name,last_name,avatar_url")
            .or(`username.ilike.${q},first_name.ilike.${q},last_name.ilike.${q}`)
            .neq("id", user?.id ?? "")
            .limit(50);
          if (error) throw error;
          setResults(((data as any[]) as ProfileItem[]) || []);
        }
      } catch (e) {
        console.error(e);
        toast.error("Search failed");
      } finally {
        setSearching(false);
      }
    };
    const t = setTimeout(run, 250);
    return () => clearTimeout(t);
  }, [open, query, user?.id]);

  const handleSelect = async (p: ProfileItem) => {
    if (!user) { toast.error("Please sign in"); return; }
    try {
      const convId = await ensureDirectConversation(user.id, p.id);
      if (!convId) throw new Error("Failed to create conversation");
      toast.success("Chat created");
      onCreated(convId);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to start chat");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
          <DialogDescription>Search for a user to start a direct conversation.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="dm-search">Search user</Label>
            <div className="relative mt-1">
              <Input
                id="dm-search"
                placeholder="Search by name or username"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8"
              />
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-white/60" />
            </div>
          </div>

          <ScrollArea className="h-64 rounded border border-white/10">
            <div className="divide-y divide-white/5">
              {searching ? (
                <div className="p-3 text-sm text-white/60">Searching…</div>
              ) : results.length === 0 && query.trim() ? (
                <div className="p-3 text-sm text-white/60">No results</div>
              ) : (
                results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-white/5 text-left"
                  >
                    <Avatar className="h-8 w-8">
                      {p.avatar_url ? (
                        <AvatarImage src={p.avatar_url} alt={displayName(p)} />
                      ) : (
                        <AvatarFallback className="bg-music-primary/20 text-music-primary">
                          {(p.username || 'U').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{displayName(p)}</div>
                      <div className="text-xs text-white/60">@{p.username}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDirectMessageModal;
