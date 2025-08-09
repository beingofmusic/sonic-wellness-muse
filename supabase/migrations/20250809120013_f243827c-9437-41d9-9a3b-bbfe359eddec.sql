-- Onboarding framework migration
-- 1) Enum for profile status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'user_onboarding_status'
  ) THEN
    CREATE TYPE public.user_onboarding_status AS ENUM ('not_started','in_progress','completed','dismissed');
  END IF;
END
$$;

-- 2) Add column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_status public.user_onboarding_status NOT NULL DEFAULT 'not_started';

-- 3) Onboarding progress table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_step integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Policies for onboarding_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'onboarding_progress' AND policyname = 'Users can view their own onboarding progress'
  ) THEN
    CREATE POLICY "Users can view their own onboarding progress"
    ON public.onboarding_progress
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'onboarding_progress' AND policyname = 'Users can upsert their own onboarding progress'
  ) THEN
    CREATE POLICY "Users can upsert their own onboarding progress"
    ON public.onboarding_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'onboarding_progress' AND policyname = 'Users can update their own onboarding progress'
  ) THEN
    CREATE POLICY "Users can update their own onboarding progress"
    ON public.onboarding_progress
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 4) Trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_onboarding_progress_updated_at'
  ) THEN
    CREATE TRIGGER trg_onboarding_progress_updated_at
    BEFORE UPDATE ON public.onboarding_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 5) Helper RPCs
CREATE OR REPLACE FUNCTION public.set_onboarding_status(p_status public.user_onboarding_status)
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
  UPDATE public.profiles
  SET onboarding_status = p_status
  WHERE id = v_user;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_onboarding_progress(p_data jsonb, p_current_step integer DEFAULT NULL)
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
  INSERT INTO public.onboarding_progress(user_id, data, current_step)
  VALUES (v_user, COALESCE(p_data, '{}'::jsonb), COALESCE(p_current_step, 0))
  ON CONFLICT (user_id) DO UPDATE
    SET data = COALESCE(public.onboarding_progress.data, '{}'::jsonb) || COALESCE(p_data, '{}'::jsonb),
        current_step = COALESCE(p_current_step, public.onboarding_progress.current_step),
        updated_at = now();
END;
$$;