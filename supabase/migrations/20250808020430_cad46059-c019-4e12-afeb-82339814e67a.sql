-- Enable realtime updates for edits and deletions and ensure edited_at is set when content changes

-- 1) Add messages tables to the realtime publication (safe to run multiple times)
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;

-- 2) Ensure full row payloads are available for UPDATE/DELETE events
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_messages REPLICA IDENTITY FULL;

-- 3) Create triggers to automatically set edited_at when content changes
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