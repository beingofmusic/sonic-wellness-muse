-- Add supporting_member to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'supporting_member';

-- Add membership tracking fields to profiles table  
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'free' CHECK (membership_tier IN ('free', 'supporting_member')),
ADD COLUMN IF NOT EXISTS membership_start_date TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS membership_end_date TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_supporting_member BOOLEAN GENERATED ALWAYS AS (membership_tier = 'supporting_member') STORED;

-- Create a function to check if user is supporting member
CREATE OR REPLACE FUNCTION public.is_supporting_member(user_uuid uuid)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT membership_tier = 'supporting_member' 
     FROM public.profiles 
     WHERE id = user_uuid), 
    false
  );
$$;

-- Update existing users to have free membership tier
UPDATE public.profiles 
SET membership_tier = 'free' 
WHERE membership_tier IS NULL;