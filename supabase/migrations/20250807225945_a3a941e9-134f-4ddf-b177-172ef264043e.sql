-- Idempotent policy setup + indexes for conversations/typing/messages

-- Conversations SELECT policy (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='conversations'
      AND policyname='Conversations visible to creator or participants'
  ) THEN
    CREATE POLICY "Conversations visible to creator or participants"
    ON public.conversations
    FOR SELECT
    USING (
      created_by = auth.uid()
      OR auth.uid() = ANY (participant_ids)
    );
  END IF;
END $$;

-- Conversations UPDATE policy (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='conversations'
      AND policyname='Creator or participants can update conversation'
  ) THEN
    CREATE POLICY "Creator or participants can update conversation"
    ON public.conversations
    FOR UPDATE
    USING (
      created_by = auth.uid()
      OR auth.uid() = ANY (participant_ids)
    );
  END IF;
END $$;

-- Ensure any legacy policy with different name is removed safely
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='conversations'
      AND policyname='Conversations visible to participants only'
  ) THEN
    DROP POLICY "Conversations visible to participants only" ON public.conversations;
  END IF;
END $$;

-- conversation_typing SELECT policy (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='conversation_typing'
      AND policyname='Participants can view typing (no public)'
  ) THEN
    CREATE POLICY "Participants can view typing (no public)"
    ON public.conversation_typing
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.conversations c
        WHERE c.id = conversation_typing.conversation_id
          AND (auth.uid() = ANY (c.participant_ids) OR c.created_by = auth.uid())
      )
    );
  END IF;
END $$;

-- Remove any legacy typing policy name safely
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='conversation_typing'
      AND policyname='Participants can view typing'
  ) THEN
    DROP POLICY "Participants can view typing" ON public.conversation_typing;
  END IF;
END $$;

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_conversations_participant_ids
  ON public.conversations USING GIN (participant_ids);

CREATE INDEX IF NOT EXISTS idx_conv_msgs_conv_id_created_at
  ON public.conversation_messages (conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_conv_msgs_user_created_at
  ON public.conversation_messages (user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_conv_parts_conv_user
  ON public.conversation_participants (conversation_id, user_id);

-- Realtime-friendly settings
ALTER TABLE public.conversation_messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_participants REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_typing REPLICA IDENTITY FULL;