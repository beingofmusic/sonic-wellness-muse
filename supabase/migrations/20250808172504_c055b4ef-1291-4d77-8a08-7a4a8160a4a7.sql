-- Threaded replies for community messages
-- 1) Add reply_to_id column (self-referential) with FK
ALTER TABLE public.community_messages
  ADD COLUMN IF NOT EXISTS reply_to_id uuid NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'community_messages_reply_to_fk'
  ) THEN
    ALTER TABLE public.community_messages
      ADD CONSTRAINT community_messages_reply_to_fk
      FOREIGN KEY (reply_to_id)
      REFERENCES public.community_messages(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 2) Index for quick lookup of replies by parent
CREATE INDEX IF NOT EXISTS idx_community_messages_reply_to_id
  ON public.community_messages(reply_to_id);