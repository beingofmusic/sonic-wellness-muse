-- Add new musical identity fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN primary_instruments TEXT[],
ADD COLUMN secondary_instruments TEXT[],
ADD COLUMN musical_interests TEXT[],
ADD COLUMN skill_level TEXT,
ADD COLUMN location TEXT,
ADD COLUMN looking_for TEXT[],
ADD COLUMN about_me TEXT;

-- Add check constraints for skill level
ALTER TABLE public.profiles 
ADD CONSTRAINT skill_level_check 
CHECK (skill_level IS NULL OR skill_level IN ('beginner', 'intermediate', 'advanced', 'pro', 'educator'));