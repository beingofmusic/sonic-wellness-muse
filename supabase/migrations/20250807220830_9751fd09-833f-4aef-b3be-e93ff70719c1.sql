-- Conversations (DMs and Groups)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group BOOLEAN NOT NULL DEFAULT false,
  name TEXT,
  image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Participants
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  muted BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (conversation_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Typing indicators (ephemeral)
CREATE TABLE IF NOT EXISTS public.conversation_typing (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_typing BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (conversation_id, user_id)
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_typing ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Conversations visible to participants or public" ON public.conversations
FOR SELECT USING (
  is_public = true OR EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Create conversations as self" ON public.conversations
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Participants or creator can update conversations" ON public.conversations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
  ) OR created_by = auth.uid()
);

-- Policies for participants
CREATE POLICY "Participants can view their conversations participants" ON public.conversation_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_participants.conversation_id AND (
      c.is_public = true OR EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = c.id AND cp.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Creator or self can add participant" ON public.conversation_participants
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_participants.conversation_id AND c.created_by = auth.uid()
  ) OR user_id = auth.uid()
);

CREATE POLICY "Participant can update their own row" ON public.conversation_participants
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Participant can leave conversation" ON public.conversation_participants
FOR DELETE USING (user_id = auth.uid());

-- Policies for messages
CREATE POLICY "Messages visible to participants or public" ON public.conversation_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_messages.conversation_id AND (
      c.is_public = true OR EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = c.id AND cp.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Participants can send messages" ON public.conversation_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_messages.conversation_id AND cp.user_id = auth.uid()
  ) AND user_id = auth.uid()
);

CREATE POLICY "Authors can update their messages" ON public.conversation_messages
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Authors can delete their messages" ON public.conversation_messages
FOR DELETE USING (user_id = auth.uid());

-- Policies for typing
CREATE POLICY "Participants can view typing" ON public.conversation_typing
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_typing.conversation_id AND (
      c.is_public = true OR EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = c.id AND cp.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Participants can upsert their typing" ON public.conversation_typing
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_typing.conversation_id AND cp.user_id = auth.uid()
  ) AND user_id = auth.uid()
);

CREATE POLICY "Participants can update their typing" ON public.conversation_typing
FOR UPDATE USING (user_id = auth.uid());

-- Triggers to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_conversation_messages_updated_at ON public.conversation_messages;
CREATE TRIGGER trg_update_conversation_messages_updated_at
BEFORE UPDATE ON public.conversation_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
