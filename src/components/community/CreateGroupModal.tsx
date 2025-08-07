import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, Users } from "lucide-react";

interface CreateGroupModalProps {
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
  (p.first_name || p.last_name) ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() : (p.username || 'User');

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ open, onOpenChange, onCreated }) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ProfileItem[]>([]);
  const [selected, setSelected] = useState<ProfileItem[]>([]);

  useEffect(() => {
    if (!open) {
      setName(""); setIsPublic(false); setQuery(""); setResults([]); setSelected([]);
    }
  }, [open]);

  useEffect(() => {
    const run = async () => {
      if (!query.trim()) { setResults([]); return; }
      setSearching(true);
      const q = `%${query.trim()}%`;
      const { data, error } = await supabase
        .from("profiles")
        .select("id,username,first_name,last_name,avatar_url")
        .or(`username.ilike.${q},first_name.ilike.${q},last_name.ilike.${q}`)
        .limit(20);
      if (error) {
        console.error(error); toast.error("Search failed");
      }
      setResults((data as any[]) as ProfileItem[] || []);
      setSearching(false);
    };
    const t = setTimeout(run, 300);
    return () => clearTimeout(t);
  }, [query]);

  const toggleSelect = (p: ProfileItem) => {
    setSelected(prev => prev.find(x => x.id === p.id) ? prev.filter(x => x.id !== p.id) : [...prev, p]);
  };

  const handleCreate = async () => {
    if (!user) { toast.error("Please sign in"); return; }
    if (!name.trim()) { toast.error("Group name is required"); return; }
    try {
      const { data: conv, error } = await supabase
        .from("conversations")
        .insert({ is_group: true, is_public: isPublic, name, created_by: user.id })
        .select("id")
        .maybeSingle();
      if (error || !conv) throw error;

      const participants = [
        { conversation_id: conv.id, user_id: user.id, role: 'owner' },
        ...selected.filter(p => p.id !== user.id).map(p => ({ conversation_id: conv.id, user_id: p.id, role: 'member' }))
      ];
      if (participants.length > 0) {
        const { error: partErr } = await supabase.from("conversation_participants").insert(participants);
        if (partErr) throw partErr;
      }

      toast.success("Group created");
      onCreated(conv.id);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to create group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>Start a private or public group chat.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="group-name">Group name</Label>
            <Input id="group-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jazz Trio" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="public-switch">Public group</Label>
              <p className="text-xs text-white/60">Public groups are visible to everyone (read-only unless invited).</p>
            </div>
            <Switch id="public-switch" checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <div>
            <Label>Add members</Label>
            <div className="relative mt-1">
              <Input
                placeholder="Search by name or username"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-8"
              />
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-white/60" />
            </div>

            {/* Selected members */}
            {selected.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.map(s => (
                  <button
                    key={s.id}
                    onClick={() => toggleSelect(s)}
                    className="px-2 py-1 text-xs rounded-full bg-music-primary/20 text-music-primary hover:bg-music-primary/30 transition"
                  >
                    {displayName(s)}
                  </button>
                ))}
              </div>
            )}

            <ScrollArea className="mt-2 h-48 rounded border border-white/10">
              <div className="divide-y divide-white/5">
                {searching ? (
                  <div className="p-3 text-sm text-white/60">Searching…</div>
                ) : results.length === 0 ? (
                  <div className="p-3 text-sm text-white/60">No results</div>
                ) : (
                  results.map(p => (
                    <button
                      key={p.id}
                      onClick={() => toggleSelect(p)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-white/5 text-left"
                    >
                      <Avatar className="h-8 w-8">
                        {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={displayName(p)} /> : <AvatarFallback className="bg-music-primary/20 text-music-primary">{(p.username || 'U').slice(0,2).toUpperCase()}</AvatarFallback>}
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{displayName(p)}</div>
                        <div className="text-xs text-white/60">@{p.username}</div>
                      </div>
                      {selected.find(x => x.id === p.id) ? (
                        <span className="text-xs text-music-primary">Selected</span>
                      ) : (
                        <Plus className="w-4 h-4 text-white/60" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate}>
            <Users className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
