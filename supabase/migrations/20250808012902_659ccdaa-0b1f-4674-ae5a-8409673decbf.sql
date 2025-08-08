-- Harden mark_message_edited function to satisfy linter
CREATE OR REPLACE FUNCTION public.mark_message_edited()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content THEN
    NEW.edited_at = now();
  END IF;
  RETURN NEW;
END;
$$;