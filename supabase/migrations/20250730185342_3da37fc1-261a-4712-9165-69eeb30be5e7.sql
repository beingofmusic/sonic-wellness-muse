-- Create user preferences table for AI routine generation
CREATE TABLE public.user_practice_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  primary_instrument TEXT,
  skill_level TEXT DEFAULT 'intermediate',
  typical_practice_duration INTEGER DEFAULT 30,
  preferred_practice_time TEXT DEFAULT 'morning',
  focus_areas TEXT[] DEFAULT '{}',
  energy_patterns JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_practice_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences" 
ON public.user_practice_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.user_practice_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_practice_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_practice_preferences_updated_at
BEFORE UPDATE ON public.user_practice_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add AI generation tracking to routines table
ALTER TABLE public.routines 
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS generation_context JSONB DEFAULT NULL;