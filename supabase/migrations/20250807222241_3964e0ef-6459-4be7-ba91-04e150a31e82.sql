-- Create conversation_messages table for DMs/Groups messages
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Participants or public can read conversation messages" ON public.conversation_messages;
CREATE POLICY "Participants or public can read conversation messages"
ON public.conversation_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_messages.conversation_id
      AND (
        c.is_public = true
        OR EXISTS (
          SELECT 1 FROM public.conversation_participants cp
          WHERE cp.conversation_id = c.id AND cp.user_id = auth.uid()
        )
      )
  )
);

DROP POLICY IF EXISTS "Participants can insert conversation messages" ON public.conversation_messages;
CREATE POLICY "Participants can insert conversation messages"
ON public.conversation_messages
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_messages.conversation_id AND cp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Message owner can update message" ON public.conversation_messages;
CREATE POLICY "Message owner can update message"
ON public.conversation_messages
FOR UPDATE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Message owner can delete message" ON public.conversation_messages;
CREATE POLICY "Message owner can delete message"
ON public.conversation_messages
FOR DELETE
USING (user_id = auth.uid());

-- Bump conversations.updated_at on new messages
CREATE OR REPLACE FUNCTION public.bump_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bump_conversation_updated_at ON public.conversation_messages;
CREATE TRIGGER trg_bump_conversation_updated_at
AFTER INSERT ON public.conversation_messages
FOR EACH ROW
EXECUTE FUNCTION public.bump_conversation_updated_at();