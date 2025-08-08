import { supabase } from "@/integrations/supabase/client";

export interface RatingSummary {
  average: number;
  count: number;
}

export interface RoutineComment {
  id: string;
  user_id: string;
  routine_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  likes?: number;
}

export const upsertRating = async (routineId: string, rating: number) => {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) throw userErr || new Error("Not authenticated");

  const { error } = await supabase
    .from("routine_feedback")
    .upsert(
      {
        user_id: user.id,
        routine_id: routineId,
        rating,
      },
      { onConflict: "user_id,routine_id" }
    );
  if (error) throw error;
};

export const getUserRating = async (routineId: string): Promise<number | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("routine_feedback")
    .select("rating")
    .eq("routine_id", routineId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data?.rating ?? null;
};

export const getRatingSummary = async (
  routineId: string
): Promise<RatingSummary> => {
  try {
    const { data, error } = await supabase.rpc("get_routine_feedback_stats", {
      routine_uuid: routineId,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return {
      average: Number(row?.average_rating ?? 0),
      count: Number(row?.ratings_count ?? 0),
    };
  } catch (e) {
    // Fallback to direct aggregation if RPC is unavailable
    const { data, error } = await supabase
      .from("routine_feedback")
      .select("rating")
      .eq("routine_id", routineId);
    if (error) throw error;
    const ratings = (data as { rating: number }[]) || [];
    const count = ratings.length;
    const average = count
      ? ratings.reduce((sum, r) => sum + (r?.rating ?? 0), 0) / count
      : 0;
    return { average, count };
  }
};

export const addComment = async (routineId: string, comment: string) => {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) throw userErr || new Error("Not authenticated");

  const { data, error } = await supabase
    .from("routine_comments")
    .insert({ routine_id: routineId, user_id: user.id, comment })
    .select("*")
    .single();
  if (error) throw error;
  return data as RoutineComment;
};

export const updateComment = async (commentId: string, comment: string) => {
  const { data, error } = await supabase
    .from("routine_comments")
    .update({ comment })
    .eq("id", commentId)
    .select("*")
    .single();
  if (error) throw error;
  return data as RoutineComment;
};

export const getUserComment = async (routineId: string): Promise<RoutineComment | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("routine_comments")
    .select("*")
    .eq("routine_id", routineId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error; // no rows
  return (data as RoutineComment) || null;
};

export const deleteComment = async (commentId: string) => {
  const { error } = await supabase
    .from("routine_comments")
    .delete()
    .eq("id", commentId);
  if (error) throw error;
};

export const listComments = async (
  routineId: string,
  limit = 10,
  offset = 0
): Promise<RoutineComment[]> => {
  // Fetch comments newest first
  const { data, error } = await supabase
    .from("routine_comments")
    .select("id, user_id, routine_id, comment, created_at, updated_at")
    .eq("routine_id", routineId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;

  const comments = (data || []) as RoutineComment[];
  if (comments.length === 0) return [];

  // Fetch likes counts in batch
  const ids = comments.map((c) => c.id);
  const { data: likesAgg, error: likesErr } = await supabase
    .from("routine_comment_likes")
    .select("comment_id")
    .in("comment_id", ids);
  if (likesErr) throw likesErr;
  const countMap = new Map<string, number>();
  (likesAgg || []).forEach((l: any) => {
    const id = l.comment_id as string;
    countMap.set(id, (countMap.get(id) || 0) + 1);
  });

  return comments.map((c) => ({ ...c, likes: countMap.get(c.id) || 0 }));
};

export const toggleLikeComment = async (commentId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Try insert, if conflict then delete
  const { error: insertErr } = await supabase
    .from("routine_comment_likes")
    .insert({ comment_id: commentId, user_id: user.id });
  if (!insertErr) return { liked: true };

  // If already exists, delete it
  const { error: deleteErr } = await supabase
    .from("routine_comment_likes")
    .delete()
    .eq("comment_id", commentId)
    .eq("user_id", user.id);
  if (deleteErr) throw deleteErr;
  return { liked: false };
};
