-- Make realtime update/delete work reliably and add edited_at triggers (idempotent)

-- Add tables to publication only if not already present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'community_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversation_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;
  END IF;
END $$;

-- Ensure full payloads for UPDATE/DELETE
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_messages REPLICA IDENTITY FULL;

-- Triggers to auto-set edited_at when content changes
DROP TRIGGER IF EXISTS set_community_message_edited ON public.community_messages;
CREATE TRIGGER set_community_message_edited
BEFORE UPDATE ON public.community_messages
FOR EACH ROW
EXECUTE FUNCTION public.mark_message_edited();

DROP TRIGGER IF EXISTS set_conversation_message_edited ON public.conversation_messages;
CREATE TRIGGER set_conversation_message_edited
BEFORE UPDATE ON public.conversation_messages
FOR EACH ROW
EXECUTE FUNCTION public.mark_message_edited();