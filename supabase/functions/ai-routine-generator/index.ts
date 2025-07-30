import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RoutineRequest {
  timeAvailable: number; // minutes
  focusArea: string; // 'tone', 'technique', 'improvisation', 'repertoire', 'creativity'
  goals: string; // user's free-text goals and objectives
  instrument: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { timeAvailable, focusArea, goals, instrument, userId }: RoutineRequest = await req.json();

    // Sanitize user input
    const sanitizedGoals = goals.trim().substring(0, 1000); // Limit to 1000 characters

    // Get user's practice history and goals
    const { data: practiceHistory } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(10);

    const { data: goals } = await supabase
      .from('practice_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('isCompleted', false);

    // Get available block templates
    const { data: blockTemplates } = await supabase
      .from('routines')
      .select(`
        *,
        routine_blocks(*)
      `)
      .eq('is_template', true)
      .eq('visibility', 'public');

    // Create AI prompt
    const prompt = `Create a personalized practice routine for a ${instrument} player with these parameters:
    
    PRIMARY GOALS: "${sanitizedGoals}"
    Time Available: ${timeAvailable} minutes
    General Focus Area: ${focusArea}
    
    User Context:
    - Recent practice sessions: ${practiceHistory?.length || 0} in last 10 sessions
    - Active goals from system: ${goals?.map(g => g.title).join(', ') || 'None'}
    
    Available block types: warmup, technique, scales, improvisation, repertoire, creativity, mindfulness, cooldown
    
    IMPORTANT: The routine should be primarily designed around the user's stated goals: "${sanitizedGoals}"
    Use the general focus area and time constraint as supporting parameters, but let the user's specific goals drive the content, exercises, and overall approach of the routine.
    
    Generate a JSON response with this structure:
    {
      "title": "Generated routine title that reflects their goals",
      "description": "Brief description addressing their specific goals",
      "estimatedDuration": ${timeAvailable},
      "blocks": [
        {
          "type": "warmup",
          "content": "Specific exercise name that supports their goals",
          "duration": 5,
          "instructions": "Detailed instructions including tempo, key, etc. that relate to their stated objectives"
        }
      ],
      "rationale": "Why this routine addresses their specific goals and current needs"
    }
    
    Make the routine practical, progressive, and specifically tailored to address: "${sanitizedGoals}"`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert music practice coach. Generate practical, time-efficient practice routines. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const aiData = await response.json();
    const generatedRoutine = JSON.parse(aiData.choices[0].message.content);

    console.log('Generated routine:', generatedRoutine);

    return new Response(JSON.stringify(generatedRoutine), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-routine-generator:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});