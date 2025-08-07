import { supabase } from "@/integrations/supabase/client";

export const ensureDirectConversation = async (currentUserId: string, targetUserId: string): Promise<string | null> => {
  try {
    // 1) Find conversations current user participates in (RLS ensures visibility)
    const { data: myConvs } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);
    const convIds = (myConvs || []).map(r => r.conversation_id);

    if (convIds.length > 0) {
      // 2) Check if any includes target user and is DM
      const { data: possible } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', targetUserId)
        .in('conversation_id', convIds);
      const matchIds = new Set((possible || []).map(r => r.conversation_id));
      if (matchIds.size > 0) {
        // Ensure it's a DM (not group)
        const { data: existing } = await supabase
          .from('conversations')
          .select('id,is_group')
          .in('id', Array.from(matchIds));
        const dm = (existing || []).find(c => !c.is_group);
        if (dm) return dm.id;
      }
    }

    // 3) Create new DM conversation and add both participants
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({ is_group: false, created_by: currentUserId, is_public: false })
      .select('id')
      .single();
    if (error || !newConv) throw error;

    // Add participants
    await supabase.from('conversation_participants').insert([
      { conversation_id: newConv.id, user_id: currentUserId, role: 'owner' },
      { conversation_id: newConv.id, user_id: targetUserId, role: 'member' }
    ]);

    return newConv.id;
  } catch (e) {
    console.error('ensureDirectConversation failed', e);
    return null;
  }
};
