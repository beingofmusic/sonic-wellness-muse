-- Routine feedback and comments schema
-- 1) Tables

-- Routine star ratings
CREATE TABLE IF NOT EXISTS public.routine_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  routine_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT routine_feedback_unique UNIQUE (user_id, routine_id)
);

-- Optional FKs (avoid auth schema). Reference public.routines
ALTER TABLE public.routine_feedback
  ADD CONSTRAINT fk_routine_feedback_routine
  FOREIGN KEY (routine_id) REFERENCES public.routines(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_routine_feedback_routine ON public.routine_feedback(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_feedback_user ON public.routine_feedback(user_id);

-- Update trigger for timestamps
CREATE TRIGGER trg_routine_feedback_updated_at
BEFORE UPDATE ON public.routine_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.routine_feedback ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='routine_feedback' AND policyname='Anyone can read routine feedback'
  ) THEN
    CREATE POLICY "Anyone can read routine feedback"
    ON public.routine_feedback FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='routine_feedback' AND policyname='Users can insert their own routine feedback'
  ) THEN
    CREATE POLICY "Users can insert their own routine feedback"
    ON public.routine_feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='routine_feedback' AND policyname='Users can update their own routine feedback'
  ) THEN
    CREATE POLICY "Users can update their own routine feedback"
    ON public.routine_feedback FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='routine_feedback' AND policyname='Users can delete their own routine feedback'
  ) THEN
    CREATE POLICY "Users can delete their own routine feedback"
    ON public.routine_feedback FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Routine comments
CREATE TABLE IF NOT EXISTS public.routine_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  routine_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT routine_comment_maxlen CHECK (char_length(comment) <= 280)
);

ALTER TABLE public.routine_comments
  ADD CONSTRAINT fk_routine_comments_routine
  FOREIGN KEY (routine_id) REFERENCES public.routines(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_routine_comments_routine ON public.routine_comments(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_comments_created ON public.routine_comments(created_at DESC);

CREATE TRIGGER trg_routine_comments_updated_at
BEFORE UPDATE ON public.routine_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.routine_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='routine_comments' AND policyname='Anyone can read routine comments'
  ) THEN
    CREATE POLICY "Anyone can read routine comments"
    ON public.routine_comments FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='routine_comments' AND policyname='Users can insert their own routine comments'
  ) THEN
    CREATE POLICY "Users can insert their own routine comments"
    ON public.routine_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='routine_comments' AND policyname='Users can update their own routine comments'
  ) THEN
    CREATE POLICY "Users can update their own routine comments"
    ON public.routine_comments FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='routine_comments' AND policyname='Users can delete their own routine comments'
  ) THEN
    CREATE POLICY "Users can delete their own routine comments"
    ON public.routine_comments FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Routine comment likes
CREATE TABLE IF NOT EXISTS public.routine_comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT routine_comment_likes_unique UNIQUE (comment_id, user_id)
);

ALTER TABLE public.routine_comment_likes
  ADD CONSTRAINT fk_routine_comment_likes_comment
  FOREIGN KEY (comment_id) REFERENCES public.routine_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_routine_comment_likes_comment ON public.routine_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_routine_comment_likes_user ON public.routine_comment_likes(user_id);

ALTER TABLE public.routine_comment_likes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='routine_comment_likes' AND policyname='Anyone can read comment likes'
  ) THEN
    CREATE POLICY "Anyone can read comment likes"
    ON public.routine_comment_likes FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='routine_comment_likes' AND policyname='Users can like comments'
  ) THEN
    CREATE POLICY "Users can like comments"
    ON public.routine_comment_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='routine_comment_likes' AND policyname='Users can unlike their own likes'
  ) THEN
    CREATE POLICY "Users can unlike their own likes"
    ON public.routine_comment_likes FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Realtime support
ALTER TABLE public.routine_feedback REPLICA IDENTITY FULL;
ALTER TABLE public.routine_comments REPLICA IDENTITY FULL;
ALTER TABLE public.routine_comment_likes REPLICA IDENTITY FULL;

-- Add to realtime publication (ignore if already added)
DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.routine_feedback;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.routine_comments;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.routine_comment_likes;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Analytics helper functions
CREATE OR REPLACE FUNCTION public.get_routine_feedback_stats(routine_uuid uuid)
RETURNS TABLE(average_rating numeric, ratings_count bigint, completion_users bigint, percent_with_rating numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_avg numeric;
  v_count bigint;
  v_users bigint;
BEGIN
  SELECT COALESCE(AVG(rating), 0)::numeric(3,2), COUNT(*)
  INTO v_avg, v_count
  FROM public.routine_feedback
  WHERE routine_id = routine_uuid;

  SELECT COUNT(DISTINCT user_id)
  INTO v_users
  FROM public.practice_sessions
  WHERE routine_id = routine_uuid;

  average_rating := v_avg;
  ratings_count := v_count;
  completion_users := v_users;
  percent_with_rating := CASE WHEN v_users = 0 THEN 0 ELSE round((v_count::numeric * 100.0 / v_users)::numeric, 2) END;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_most_commented_routines(limit_count integer DEFAULT 10)
RETURNS TABLE(routine_id uuid, comments_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT routine_id, COUNT(*) AS comments_count
  FROM public.routine_comments
  GROUP BY routine_id
  ORDER BY comments_count DESC
  LIMIT limit_count
$$;

CREATE OR REPLACE FUNCTION public.get_user_feedback_timeseries(user_uuid uuid)
RETURNS TABLE(day date, ratings_count bigint, comments_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH ratings AS (
    SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS cnt
    FROM public.routine_feedback
    WHERE user_id = user_uuid
    GROUP BY 1
  ), comments AS (
    SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS cnt
    FROM public.routine_comments
    WHERE user_id = user_uuid
    GROUP BY 1
  )
  SELECT COALESCE(r.day, c.day) AS day,
         COALESCE(r.cnt, 0)::bigint AS ratings_count,
         COALESCE(c.cnt, 0)::bigint AS comments_count
  FROM ratings r
  FULL OUTER JOIN comments c ON r.day = c.day
  ORDER BY day DESC
$$;