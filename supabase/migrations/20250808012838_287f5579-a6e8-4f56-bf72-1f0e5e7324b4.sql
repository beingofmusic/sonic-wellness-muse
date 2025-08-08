-- Edit/Delete support for messages: add edited_at/deleted_at columns and admin policies

-- Community messages: columns
ALTER TABLE public.community_messages
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID;

-- Conversation messages: columns
ALTER TABLE public.conversation_messages
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID;

-- Foreign keys for deleted_by
DO $$ BEGIN
  ALTER TABLE public.community_messages
    ADD CONSTRAINT community_messages_deleted_by_fkey
    FOREIGN KEY (deleted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.conversation_messages
    ADD CONSTRAINT conversation_messages_deleted_by_fkey
    FOREIGN KEY (deleted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trigger function to mark edited when content changes
CREATE OR REPLACE FUNCTION public.mark_message_edited()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content THEN
    NEW.edited_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for both tables
DROP TRIGGER IF EXISTS trg_community_messages_edited ON public.community_messages;
CREATE TRIGGER trg_community_messages_edited
BEFORE UPDATE ON public.community_messages
FOR EACH ROW EXECUTE FUNCTION public.mark_message_edited();

DROP TRIGGER IF EXISTS trg_conversation_messages_edited ON public.conversation_messages;
CREATE TRIGGER trg_conversation_messages_edited
BEFORE UPDATE ON public.conversation_messages
FOR EACH ROW EXECUTE FUNCTION public.mark_message_edited();

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Admin policies for community messages
DO $$ BEGIN
  CREATE POLICY "Admins can update any community message"
  ON public.community_messages
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','team')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','team')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete any community message"
  ON public.community_messages
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','team')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admin policies for conversation messages
DO $$ BEGIN
  CREATE POLICY "Admins can update any conversation message"
  ON public.conversation_messages
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','team')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','team')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete any conversation message"
  ON public.conversation_messages
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','team')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;