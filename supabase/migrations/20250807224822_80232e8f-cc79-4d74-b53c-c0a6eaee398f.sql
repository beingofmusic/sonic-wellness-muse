
-- 1) Conversations: break recursion and allow creator to read immediately
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

CREATE POLICY "Conversations visible to creator or participants"
ON public.conversations
FOR SELECT
USING (
  -- Creator can always see it (important right after INSERT)
  created_by = auth.uid()
  OR auth.uid() = ANY (participant_ids)
);

-- 2) Conversations UPDATE: align with the same non-recursive membership rule
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='conversations'
      AND policyname='Participants or creator can update conversations'
  ) THEN
    DROP POLICY "Participants or creator can update conversations" ON public.conversations;
  END IF;
END $$;

CREATE POLICY "Creator or participants can update conversation"
ON public.conversations
FOR UPDATE
USING (
  created_by = auth.uid()
  OR auth.uid() = ANY (participant_ids)
);

-- Keep existing INSERT policy (created_by = auth.uid()) as-is.

-- 3) Typing visibility: remove any public path; rely on conversation membership only
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

-- 4) Performance: index for membership lookups
CREATE INDEX IF NOT EXISTS idx_conversations_participant_ids
  ON public.conversations
  USING GIN (participant_ids);
