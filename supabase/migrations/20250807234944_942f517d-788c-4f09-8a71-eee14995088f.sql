-- Message Reactions feature: tables, policies, RPCs, realtime

-- 1) Tables
CREATE TABLE IF NOT EXISTS public.community_message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.community_channels(id) ON DELETE CASCADE,
  message_id uuid NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji text NOT NULL CHECK (char_length(emoji) <= 8),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_message_reactions_unique UNIQUE (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cmr_message_id ON public.community_message_reactions (message_id);
CREATE INDEX IF NOT EXISTS idx_cmr_message_emoji ON public.community_message_reactions (message_id, emoji);
CREATE INDEX IF NOT EXISTS idx_cmr_channel_id ON public.community_message_reactions (channel_id);
CREATE INDEX IF NOT EXISTS idx_cmr_user_time ON public.community_message_reactions (user_id, created_at);

CREATE TABLE IF NOT EXISTS public.conversation_message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id uuid NOT NULL REFERENCES public.conversation_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji text NOT NULL CHECK (char_length(emoji) <= 8),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversation_message_reactions_unique UNIQUE (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_vmr_message_id ON public.conversation_message_reactions (message_id);
CREATE INDEX IF NOT EXISTS idx_vmr_message_emoji ON public.conversation_message_reactions (message_id, emoji);
CREATE INDEX IF NOT EXISTS idx_vmr_conversation_id ON public.conversation_message_reactions (conversation_id);
CREATE INDEX IF NOT EXISTS idx_vmr_user_time ON public.conversation_message_reactions (user_id, created_at);

-- 2) Row Level Security
ALTER TABLE public.community_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_message_reactions ENABLE ROW LEVEL SECURITY;

-- Community reactions policies
DO $$ BEGIN
  CREATE POLICY "Community reactions are viewable by authenticated users"
  ON public.community_message_reactions
  FOR SELECT
  TO authenticated
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own community reactions"
  ON public.community_message_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own community reactions"
  ON public.community_message_reactions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users or admins can delete community reactions"
  ON public.community_message_reactions
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin','team')
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Conversation reactions policies
DO $$ BEGIN
  CREATE POLICY "Participants can view conversation reactions"
  ON public.conversation_message_reactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversation_messages m
      JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = message_id AND cp.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Participants can insert their own conversation reactions"
  ON public.conversation_message_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND EXISTS (
      SELECT 1
      FROM public.conversation_messages m
      JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = message_id AND cp.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own conversation reactions"
  ON public.conversation_message_reactions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users or admins can delete conversation reactions"
  ON public.conversation_message_reactions
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin','team')
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) RPC Functions for add/toggle & list with rate-limiting

-- Add or toggle reaction in community (10/min per user per channel)
CREATE OR REPLACE FUNCTION public.add_or_toggle_community_reaction(
  p_message_id uuid,
  p_channel_id uuid,
  p_emoji text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_existing_id uuid;
  v_existing_emoji text;
  v_count int;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Rate limit: 10 reactions per minute per channel
  SELECT count(*) INTO v_count
  FROM public.community_message_reactions r
  WHERE r.user_id = v_user
    AND r.channel_id = p_channel_id
    AND r.created_at > now() - interval '1 minute';
  IF v_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded';
  END IF;

  -- Toggle/Upsert
  SELECT id, emoji INTO v_existing_id, v_existing_emoji
  FROM public.community_message_reactions
  WHERE message_id = p_message_id AND user_id = v_user;

  IF v_existing_id IS NULL THEN
    INSERT INTO public.community_message_reactions (channel_id, message_id, user_id, emoji)
    VALUES (p_channel_id, p_message_id, v_user, p_emoji);
  ELSE
    IF v_existing_emoji = p_emoji THEN
      DELETE FROM public.community_message_reactions WHERE id = v_existing_id;
    ELSE
      UPDATE public.community_message_reactions SET emoji = p_emoji, created_at = now() WHERE id = v_existing_id;
    END IF;
  END IF;
END;
$$;

-- Add or toggle reaction in conversation (10/min per user per conversation)
CREATE OR REPLACE FUNCTION public.add_or_toggle_conversation_reaction(
  p_message_id uuid,
  p_conversation_id uuid,
  p_emoji text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_existing_id uuid;
  v_existing_emoji text;
  v_count int;
  v_is_participant boolean;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Ensure user is a participant
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = p_conversation_id AND cp.user_id = v_user
  ) INTO v_is_participant;
  IF NOT v_is_participant THEN
    RAISE EXCEPTION 'Not authorized for this conversation';
  END IF;

  -- Rate limit: 10 per minute per conversation
  SELECT count(*) INTO v_count
  FROM public.conversation_message_reactions r
  WHERE r.user_id = v_user
    AND r.conversation_id = p_conversation_id
    AND r.created_at > now() - interval '1 minute';
  IF v_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded';
  END IF;

  -- Toggle/Upsert
  SELECT id, emoji INTO v_existing_id, v_existing_emoji
  FROM public.conversation_message_reactions
  WHERE message_id = p_message_id AND user_id = v_user;

  IF v_existing_id IS NULL THEN
    INSERT INTO public.conversation_message_reactions (conversation_id, message_id, user_id, emoji)
    VALUES (p_conversation_id, p_message_id, v_user, p_emoji);
  ELSE
    IF v_existing_emoji = p_emoji THEN
      DELETE FROM public.conversation_message_reactions WHERE id = v_existing_id;
    ELSE
      UPDATE public.conversation_message_reactions SET emoji = p_emoji, created_at = now() WHERE id = v_existing_id;
    END IF;
  END IF;
END;
$$;

-- List all reactions for a community channel with profile info
CREATE OR REPLACE FUNCTION public.list_community_reactions(
  p_channel_id uuid
) RETURNS TABLE(
  message_id uuid,
  user_id uuid,
  emoji text,
  created_at timestamptz,
  username text,
  first_name text,
  last_name text,
  avatar_url text
) LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT r.message_id, r.user_id, r.emoji, r.created_at,
         p.username, p.first_name, p.last_name, p.avatar_url
  FROM public.community_message_reactions r
  JOIN public.profiles p ON p.id = r.user_id
  WHERE r.channel_id = p_channel_id
$$;

-- List all reactions for a conversation with profile info (participant-gated)
CREATE OR REPLACE FUNCTION public.list_conversation_reactions(
  p_conversation_id uuid
) RETURNS TABLE(
  message_id uuid,
  user_id uuid,
  emoji text,
  created_at timestamptz,
  username text,
  first_name text,
  last_name text,
  avatar_url text
) LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT r.message_id, r.user_id, r.emoji, r.created_at,
         p.username, p.first_name, p.last_name, p.avatar_url
  FROM public.conversation_message_reactions r
  JOIN public.profiles p ON p.id = r.user_id
  WHERE r.conversation_id = p_conversation_id
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = p_conversation_id AND cp.user_id = auth.uid()
    )
$$;

-- 4) Realtime setup
ALTER TABLE public.community_message_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_message_reactions REPLICA IDENTITY FULL;

-- Add to realtime publication
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.community_message_reactions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_message_reactions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;