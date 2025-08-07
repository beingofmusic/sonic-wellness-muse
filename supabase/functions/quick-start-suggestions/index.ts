import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserContext {
  stats?: {
    totalPracticeMinutes?: number;
    currentStreak?: number;
    sessionCount?: number;
  };
  lastActivity?: string | null;
  routines?: Array<{ id: string; title: string; updated_at?: string }>;
  goals?: Array<{ id: string; title: string; category?: string; progress?: number }>; 
  courses?: Array<{ id: string; title: string; completion_percentage: number; last_interaction?: string | null }>;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userContext } = await req.json();
    const uc = (userContext || {}) as UserContext;

    // Simple deterministic fallback (no OpenAI key needed)
    const fallback = (): Suggestion[] => {
      const total = uc.stats?.totalPracticeMinutes ?? 0;
      const hasRoutines = (uc.routines?.length ?? 0) > 0;
      const inProgressCourse = (uc.courses || []).find(c => c.completion_percentage > 0 && c.completion_percentage < 100);
      const lastRoutine = (uc.routines || [])[0];

      if (!hasRoutines && total < 10) {
        return [
          { id: 'create-first', title: 'Create Your First Practice Routine', description: 'Build a simple, focused routine to get started in minutes.', ctaLabel: 'Create Routine', href: '/practice/builder' },
          { id: 'guided', title: 'Start a Guided Session', description: 'Answer a few questions and get an AI-crafted session for today.', ctaLabel: 'Try AI Routine', href: '/practice/ai-routine' },
          { id: 'browse-courses', title: 'Browse the Course Library', description: 'Explore beginner-friendly modules to build momentum.', ctaLabel: 'Explore Courses', href: '/courses' },
        ];
      }

      const suggestions: Suggestion[] = [];

      if (lastRoutine) {
        suggestions.push({
          id: 'continue-routine',
          title: 'Continue Yesterday’s Practice',
          description: `Pick up where you left off with ${lastRoutine.title}.`,
          ctaLabel: 'Resume Routine',
          href: `/practice/routine/${lastRoutine.id}`,
        });
      } else {
        suggestions.push({
          id: 'open-practice',
          title: 'Start an Open Practice Session',
          description: 'No plan? Use tools like metronome and drone to focus today.',
          ctaLabel: 'Open Practice',
          href: '/practice',
        });
      }

      if (inProgressCourse) {
        suggestions.push({
          id: 'continue-course',
          title: `Complete Your ${inProgressCourse.title} Module`,
          description: 'Knock out the next lesson to keep your momentum.',
          ctaLabel: 'Continue Course',
          href: `/courses/${inProgressCourse.id}`,
        });
      } else {
        suggestions.push({
          id: 'discover-course',
          title: 'Try a Recommended Course',
          description: 'Find a course aligned with your interests and goals.',
          ctaLabel: 'Browse Courses',
          href: '/courses',
        });
      }

      suggestions.push({
        id: 'try-new-routine',
        title: 'Try a New Routine Based on Your Interests',
        description: 'Generate a fresh practice plan tailored to your goals.',
        ctaLabel: 'Generate Routine',
        href: '/practice/ai-routine',
      });

      return suggestions;
    };

    // If no API key, return deterministic fallback
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ suggestions: fallback() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build prompt for OpenAI
    const systemPrompt = `You are an assistant for a music practice app. Given a user's recent behavior, goals, and courses, output 3-5 concise, highly actionable next steps that reduce decision paralysis and maximize likelihood of engaging now.
Return ONLY valid JSON with an array named suggestions. Each suggestion must have: id, title, description, ctaLabel, href. Keep titles under 60 chars and descriptions under 120 chars. Prefer direct deep links.`;

    const userPrompt = JSON.stringify({ userContext: uc });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4,
      }),
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();

    // Attempt to parse JSON, else use fallback
    let parsed: { suggestions?: Suggestion[] } = {};
    try {
      if (content) parsed = JSON.parse(content);
    } catch (_) {}

    const result = parsed?.suggestions && Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
      ? parsed.suggestions
      : fallback();

    return new Response(JSON.stringify({ suggestions: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in quick-start-suggestions function:', error);
    return new Response(JSON.stringify({ suggestions: [] }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
