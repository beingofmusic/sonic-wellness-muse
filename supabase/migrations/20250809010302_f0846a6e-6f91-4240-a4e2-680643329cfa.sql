-- Create onboarding status table to track progress and data
CREATE TABLE IF NOT EXISTS public.onboarding_status (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS and policies
ALTER TABLE public.onboarding_status ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Select own
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'onboarding_status' AND policyname = 'Users can view their own onboarding status'
  ) THEN
    CREATE POLICY "Users can view their own onboarding status"
      ON public.onboarding_status
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  -- Insert own
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'onboarding_status' AND policyname = 'Users can insert their own onboarding status'
  ) THEN
    CREATE POLICY "Users can insert their own onboarding status"
      ON public.onboarding_status
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Update own
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'onboarding_status' AND policyname = 'Users can update their own onboarding status'
  ) THEN
    CREATE POLICY "Users can update their own onboarding status"
      ON public.onboarding_status
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger to keep updated_at fresh
DROP TRIGGER IF EXISTS update_onboarding_status_updated_at ON public.onboarding_status;
CREATE TRIGGER update_onboarding_status_updated_at
BEFORE UPDATE ON public.onboarding_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Convenience function to mark onboarding complete and award welcome badge
CREATE OR REPLACE FUNCTION public.complete_onboarding()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.onboarding_status (user_id, completed, current_step, completed_at)
  VALUES (v_user, true, 999, now())
  ON CONFLICT (user_id)
  DO UPDATE SET completed = true, completed_at = now(), current_step = EXCLUDED.current_step;

  -- Award welcome badge via existing function
  PERFORM public.award_welcome_badge_for_current_user();
END;
$$;

-- Extend practice preferences to include a weekly practice minutes goal
ALTER TABLE public.user_practice_preferences
ADD COLUMN IF NOT EXISTS weekly_practice_minutes_goal integer DEFAULT 120;