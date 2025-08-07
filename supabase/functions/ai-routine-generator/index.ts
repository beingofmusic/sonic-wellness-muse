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
  // Optional personalization fields
  skillLevel?: string; // beginner, intermediate, advanced
  genres?: string[]; // e.g., ['jazz','classical']
  mood?: string; // e.g., 'focused', 'creative', 'recovering'
  challenges?: string; // user's current challenges
  preferences?: {
    metronome?: boolean;
    drone?: boolean;
    recording?: boolean;
  };
  equipment?: string[]; // e.g., ['piano','amp','backing-tracks']
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { timeAvailable, focusArea, goals, instrument, userId, skillLevel, genres, mood, challenges, preferences, equipment }: RoutineRequest = await req.json();

    // Check for required OpenAI API key
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize user input
    const sanitizedGoals = goals.trim().substring(0, 1000); // Limit to 1000 characters

    // Get user's practice history and goals
    const { data: practiceHistory } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(10);

    const { data: userGoals } = await supabase
      .from('practice_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('progress', '<', 100);

    // Get user profile (if available)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

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
    const prompt = `You are "Being of Music" practice coach for musicians.
    
    Generate a highly personalized, creative, and practical practice routine as valid JSON ONLY, following the schema. Favor specificity (tempos, keys, reps) and link everything to the user's goals.
    
    USER INPUT
    - Goals: "${sanitizedGoals}"
    - Time Available: ${timeAvailable} minutes
    - Focus Area: ${focusArea}
    - Instrument: ${instrument}
    - Skill Level: ${skillLevel || (profile as any)?.experience_level || 'unspecified'}
    - Genres: ${(genres && genres.length ? genres.join(', ') : ((profile as any)?.genres ? (Array.isArray((profile as any).genres) ? (profile as any).genres.join(', ') : String((profile as any).genres)) : 'unspecified'))}
    - Mood: ${mood || 'unspecified'}
    - Challenges: ${challenges || 'none'}
    - Preferences: ${JSON.stringify(preferences || {})}
    - Equipment: ${(equipment && equipment.length ? equipment.join(', ') : 'unspecified')}
    
    RECENT CONTEXT
    - Recent practice sessions counted: ${practiceHistory?.length || 0} (last 10)
    - Active goals from system: ${userGoals?.map(g => g.title).join(', ') || 'None'}
    - Available public templates: ${blockTemplates?.length || 0}
    
    BLOCK TYPES AVAILABLE
    warmup, technique, scales, improvisation, repertoire, creativity, mindfulness, cooldown
    
    STRICT JSON SCHEMA
    {
      "title": string,
      "description": string,
      "estimatedDuration": number, // total minutes, must be <= ${timeAvailable}
      "blocks": [
        {
          "type": "warmup" | "technique" | "scales" | "improvisation" | "repertoire" | "creativity" | "mindfulness" | "cooldown",
          "content": string,         // concise exercise name
          "duration": number,        // minutes
          "instructions": string     // concrete steps with tempos/keys/reps
        }
      ],
      "rationale": string,           // why this addresses user's goals
      "tips": string[]               // 3-5 quick tips tailored to the user
    }
    
    GUIDELINES
    - Prioritize the user's written goals above all else.
    - Make durations add up to ${timeAvailable} minutes (±2 minutes max).
    - Include variety and micro-breaks when appropriate.
    - If "mood" indicates fatigue or recovery, reduce load and add mindfulness/cooldown.
    - If preferences.drone === true, incorporate drone practice. If preferences.metronome === true, include tempo ladders.
    - Return ONLY the JSON object, with no backticks, comments, or extra text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert music practice coach. Generate practical, time-efficient practice routines. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('OpenAI error details:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to generate routine from AI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await response.json();
    
    if (!aiData.choices?.[0]?.message?.content) {
      console.error('Invalid AI response structure:', aiData);
      return new Response(JSON.stringify({ error: 'Invalid response from AI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Robust JSON extraction in case the model includes stray text
    let content = aiData.choices[0].message.content;
    let jsonText = content;
    try {
      // Try direct parse first
      const direct = JSON.parse(content);
      console.log('Generated routine (direct JSON):', direct);
      return new Response(JSON.stringify(direct), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (_) {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error('Failed to locate JSON in AI response:', content);
        return new Response(JSON.stringify({ error: 'AI did not return valid JSON' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      jsonText = match[0];
    }
    const generatedRoutine = JSON.parse(jsonText);
    console.log('Generated routine (extracted JSON):', generatedRoutine);

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