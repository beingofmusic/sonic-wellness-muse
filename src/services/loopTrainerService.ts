import { supabase } from "@/integrations/supabase/client";
import { LoopTrainerSession, LoopTrainerFormData } from "@/types/loopTrainer";

export const loopTrainerService = {
  // Create a new loop trainer session
  async createSession(sessionData: LoopTrainerFormData): Promise<LoopTrainerSession> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("loop_trainer_sessions")
      .insert({
        user_id: user.id,
        ...sessionData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's loop trainer sessions with pagination
  async getUserSessions(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      orderBy?: "created_at" | "updated_at";
      orderDirection?: "asc" | "desc";
    } = {}
  ): Promise<{ sessions: LoopTrainerSession[]; count: number }> {
    const {
      limit = 20,
      offset = 0,
      orderBy = "created_at",
      orderDirection = "desc"
    } = options;

    const query = supabase
      .from("loop_trainer_sessions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order(orderBy, { ascending: orderDirection === "asc" })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;
    return { sessions: data || [], count: count || 0 };
  },

  // Get a specific session by ID
  async getSessionById(sessionId: string): Promise<LoopTrainerSession | null> {
    const { data, error } = await supabase
      .from("loop_trainer_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data;
  },

  // Update a loop trainer session
  async updateSession(
    sessionId: string,
    updates: Partial<LoopTrainerFormData>
  ): Promise<LoopTrainerSession> {
    const { data, error } = await supabase
      .from("loop_trainer_sessions")
      .update(updates)
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a loop trainer session
  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from("loop_trainer_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) throw error;
  },

  // Update session stats (loop count, practice time)
  async updateSessionStats(
    sessionId: string,
    stats: {
      loop_count?: number;
      total_practice_time?: number;
      session_notes?: string;
    }
  ): Promise<LoopTrainerSession> {
    const { data, error } = await supabase
      .from("loop_trainer_sessions")
      .update(stats)
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's practice statistics
  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalPracticeTime: number;
    totalLoops: number;
    averageSessionLength: number;
    favoriteSpeedRange: string;
    mostPracticedVideos: Array<{
      video_title: string;
      youtube_url: string;
      session_count: number;
      total_time: number;
    }>;
  }> {
    // Get basic stats
    const { data: sessions, error } = await supabase
      .from("loop_trainer_sessions")
      .select("total_practice_time, loop_count, playback_speed, video_title, youtube_url")
      .eq("user_id", userId);

    if (error) throw error;

    const totalSessions = sessions.length;
    const totalPracticeTime = sessions.reduce((sum, s) => sum + s.total_practice_time, 0);
    const totalLoops = sessions.reduce((sum, s) => sum + s.loop_count, 0);
    const averageSessionLength = totalSessions > 0 ? totalPracticeTime / totalSessions : 0;

    // Calculate favorite speed range
    const speedRanges = {
      "Slow (0.25-0.75x)": sessions.filter(s => s.playback_speed < 0.75).length,
      "Normal (0.75-1.25x)": sessions.filter(s => s.playback_speed >= 0.75 && s.playback_speed <= 1.25).length,
      "Fast (1.25x+)": sessions.filter(s => s.playback_speed > 1.25).length,
    };
    
    const favoriteSpeedRange = Object.entries(speedRanges)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "Normal";

    // Get most practiced videos
    const videoStats = sessions.reduce((acc, session) => {
      const key = session.youtube_url;
      if (!acc[key]) {
        acc[key] = {
          video_title: session.video_title || "Untitled",
          youtube_url: session.youtube_url,
          session_count: 0,
          total_time: 0
        };
      }
      acc[key].session_count++;
      acc[key].total_time += session.total_practice_time;
      return acc;
    }, {} as Record<string, any>);

    const mostPracticedVideos = Object.values(videoStats)
      .sort((a: any, b: any) => b.total_time - a.total_time)
      .slice(0, 5);

    return {
      totalSessions,
      totalPracticeTime,
      totalLoops,
      averageSessionLength,
      favoriteSpeedRange,
      mostPracticedVideos
    };
  },

  // Search sessions by video title or notes
  async searchSessions(
    userId: string,
    searchTerm: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ sessions: LoopTrainerSession[]; count: number }> {
    const { limit = 20, offset = 0 } = options;

    const { data, error, count } = await supabase
      .from("loop_trainer_sessions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .or(`video_title.ilike.%${searchTerm}%,session_notes.ilike.%${searchTerm}%`)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { sessions: data || [], count: count || 0 };
  }
};