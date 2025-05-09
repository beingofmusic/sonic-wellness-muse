
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, userId, conversationHistory = [] } = await req.json();

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined");
    }

    // Create a conversation history in the OpenAI format
    const formattedConversationHistory = conversationHistory.map((msg) => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.content,
    }));

    // Prepare the OpenAI API request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a warm, supportive AI assistant for a music education platform called "Being of Music". 
            Your personality is inspirational and empathetic. You speak with an encouraging tone that elevates the user's mindset.
            You're knowledgeable about music education, practice techniques, and wellness for musicians.
            Respond concisely (under 800 tokens). Be helpful and supportive about the challenges musicians face.
            Maintain a consistent voice that is warm, inspiring, and occasionally profound.`
          },
          ...formattedConversationHistory,
          { role: "user", content: message },
        ],
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from OpenAI");
    }

    const aiResponse = data.choices[0].message.content;

    // If we have a valid user ID and Supabase credentials, save the conversation
    if (userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Save the user message
      await supabase
        .from("ai_assistant_conversations")
        .insert({ user_id: userId, is_user: true, content: message });

      // Save the AI response
      await supabase
        .from("ai_assistant_conversations")
        .insert({ user_id: userId, is_user: false, content: aiResponse });
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in AI Assistant function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred with the AI Assistant" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
