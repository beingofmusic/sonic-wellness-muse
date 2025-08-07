-- 1) Add participant_ids array column to conversations to avoid recursive RLS checks
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='conversations' AND column_name='participant_ids'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN participant_ids uuid[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

-- 2) Backfill participant_ids for existing conversations
UPDATE public.conversations c
SET participant_ids = COALESCE(ARRAY(
  SELECT cp.user_id FROM public.conversation_participants cp
  WHERE cp.conversation_id = c.id
), '{}');

-- 3) Create trigger function to keep participant_ids in sync
CREATE OR REPLACE FUNCTION public.sync_conversation_participants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.conversations
    SET participant_ids = ARRAY(
      SELECT DISTINCT user_id FROM public.conversation_participants
      WHERE conversation_id = NEW.conversation_id
    )
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.conversations
    SET participant_ids = ARRAY(
      SELECT DISTINCT user_id FROM public.conversation_participants
      WHERE conversation_id = OLD.conversation_id
    )
    WHERE id = OLD.conversation_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.conversation_id = OLD.conversation_id THEN
      UPDATE public.conversations
      SET participant_ids = ARRAY(
        SELECT DISTINCT user_id FROM public.conversation_participants
        WHERE conversation_id = NEW.conversation_id
      )
      WHERE id = NEW.conversation_id;
    ELSE
      UPDATE public.conversations
      SET participant_ids = ARRAY(
        SELECT DISTINCT user_id FROM public.conversation_participants
        WHERE conversation_id = OLD.conversation_id
      )
      WHERE id = OLD.conversation_id;
      UPDATE public.conversations
      SET participant_ids = ARRAY(
        SELECT DISTINCT user_id FROM public.conversation_participants
        WHERE conversation_id = NEW.conversation_id
      )
      WHERE id = NEW.conversation_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- 4) Create trigger to call the sync function on participant changes
DROP TRIGGER IF EXISTS trg_sync_conversation_participants ON public.conversation_participants;
CREATE TRIGGER trg_sync_conversation_participants
AFTER INSERT OR UPDATE OR DELETE ON public.conversation_participants
FOR EACH ROW EXECUTE FUNCTION public.sync_conversation_participants();

-- 5) Fix recursive SELECT policy on conversation_participants
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='conversation_participants'
      AND policyname='Participants can view their conversations participants'
  ) THEN
    DROP POLICY "Participants can view their conversations participants" ON public.conversation_participants;
  END IF;
END $$;

CREATE POLICY "Members can view participants (no recursion)"
ON public.conversation_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_participants.conversation_id
      AND auth.uid() = ANY (c.participant_ids)
  )
);

-- 6) Optionally tighten conversations visibility to members only (remove public toggling semantics)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='conversations'
      AND policyname='Conversations visible to participants or public'
  ) THEN
    DROP POLICY "Conversations visible to participants or public" ON public.conversations;
    CREATE POLICY "Conversations visible to participants only"
    ON public.conversations
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = conversations.id
          AND cp.user_id = auth.uid()
      )
    );
  END IF;
END $$;
