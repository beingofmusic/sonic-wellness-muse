import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import { useUserRoutines } from "@/hooks/useUserRoutines";
import { useGoals } from "@/hooks/useGoals";
import { useUserCourseProgress } from "@/hooks/useUserCourseProgress";

export interface QuickStartSuggestion {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
}

export const useQuickStartSuggestions = () => {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = usePracticeStats();
  const { routines = [], isLoading: routinesLoading } = useUserRoutines(5);
  const { goals = [], isLoading: goalsLoading } = useGoals();
  const { data: courses = [], isLoading: coursesLoading } = useUserCourseProgress();

  // Get last activity (latest completed practice session)
  const lastActivityQuery = useQuery({
    queryKey: ["last-activity", user?.id],
    queryFn: async () => {
      if (!user) return null as string | null;
      const { data, error } = await supabase
        .from("practice_sessions")
        .select("completed_at, routine_id")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0]?.completed_at ?? null;
    },
    enabled: !!user,
  });

  const isLoading = statsLoading || routinesLoading || goalsLoading || coursesLoading || lastActivityQuery.isLoading;

  const suggestionsQuery = useQuery<QuickStartSuggestion[]>({
    queryKey: [
      "quick-start-suggestions",
      user?.id,
      stats.totalPracticeMinutes,
      stats.currentStreak,
      routines.length,
      goals.length,
      courses.length,
      lastActivityQuery.data,
    ],
    enabled: !!user && !isLoading,
    queryFn: async (): Promise<QuickStartSuggestion[]> => {
      const total = stats.totalPracticeMinutes ?? 0;
      const lastRoutine = routines?.[0];
      const inProgressCourse = (courses || []).find(c => c.completion_percentage > 0 && c.completion_percentage < 100);

      // Default suggestions (deterministic)
      let base: QuickStartSuggestion[];
      if ((!routines || routines.length === 0) && total < 10) {
        base = [
          { id: 'create-first', title: 'Create Your First Practice Routine', description: 'Build a simple, focused routine to get started in minutes.', ctaLabel: 'Create Routine', href: '/practice/builder' },
          { id: 'guided', title: 'Start a Guided Session', description: 'Answer a few questions and get an AI-crafted session for today.', ctaLabel: 'Try AI Routine', href: '/practice/ai-routine' },
          { id: 'browse-courses', title: 'Browse the Course Library', description: 'Explore beginner-friendly modules to build momentum.', ctaLabel: 'Explore Courses', href: '/courses' },
        ];
      } else {
        base = [
          lastRoutine
            ? { id: 'continue-routine', title: 'Continue Yesterday’s Practice', description: `Pick up where you left off with ${lastRoutine.title}.`, ctaLabel: 'Resume Routine', href: `/practice/routine/${lastRoutine.id}` }
            : { id: 'open-practice', title: 'Start an Open Practice Session', description: 'Use metronome and drone to focus today.', ctaLabel: 'Open Practice', href: '/practice' },
          inProgressCourse
            ? { id: 'continue-course', title: `Complete Your ${inProgressCourse.title} Module`, description: 'Knock out the next lesson to keep your momentum.', ctaLabel: 'Continue Course', href: `/courses/${inProgressCourse.id}` }
            : { id: 'discover-course', title: 'Try a Recommended Course', description: 'Find a course aligned with your interests and goals.', ctaLabel: 'Browse Courses', href: '/courses' },
          { id: 'try-new-routine', title: 'Try a New Routine Based on Your Interests', description: 'Generate a fresh practice plan tailored to your goals.', ctaLabel: 'Generate Routine', href: '/practice/ai-routine' },
        ];
      }

      // Ask edge function (AI) to refine
      try {
        const { data, error } = await supabase.functions.invoke('quick-start-suggestions', {
          body: {
            userContext: {
              stats,
              lastActivity: lastActivityQuery.data,
              routines: routines.map(r => ({ id: r.id, title: r.title, updated_at: r.updated_at })),
              goals: goals.map(g => ({ id: g.id, title: g.title, category: g.category, progress: g.progress })),
              courses: (courses || []).map(c => ({ id: c.id, title: c.title, completion_percentage: c.completion_percentage, last_interaction: c.last_interaction || null })),
            }
          }
        });
        const ai = (data as any)?.suggestions as QuickStartSuggestion[] | undefined;
        if (error) throw error;
        if (ai && Array.isArray(ai) && ai.length > 0) return ai;
      } catch (e) {
        // Silently fall back
        console.warn('AI suggestions unavailable, using defaults', e);
      }

      return base;
    },
  });

  return {
    suggestions: suggestionsQuery.data || [],
    isLoading: isLoading || suggestionsQuery.isLoading,
    refetch: suggestionsQuery.refetch,
  };
};
