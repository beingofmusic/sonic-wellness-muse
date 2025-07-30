-- Create community_channels table
CREATE TABLE public.community_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on community_channels
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view channels
CREATE POLICY "Anyone can view channels"
ON public.community_channels
FOR SELECT
USING (true);

-- Only admins can manage channels
CREATE POLICY "Only admins can manage channels"
ON public.community_channels
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Add channel_id to community_messages
ALTER TABLE public.community_messages 
ADD COLUMN channel_id UUID REFERENCES public.community_channels(id) ON DELETE CASCADE;

-- Insert default channels
INSERT INTO public.community_channels (name, description, slug, order_index) VALUES
('🎺 Trumpet Talk', 'Share trumpet techniques, pieces, and performances', 'trumpet-talk', 1),
('🎷 Saxophone Shed', 'Saxophone players unite! Tips, exercises, and jam sessions', 'saxophone-shed', 2),
('🧘 Wellness & Mindset', 'Mental health, mindfulness, and musician wellness', 'wellness-mindset', 3),
('🌀 Practice Challenges', 'Set goals, share progress, and motivate each other', 'practice-challenges', 4),
('🗣️ General Chat', 'Everything music and community related', 'general-chat', 5);

-- Migrate existing messages to General Chat channel
UPDATE public.community_messages 
SET channel_id = (SELECT id FROM public.community_channels WHERE slug = 'general-chat')
WHERE channel_id IS NULL;

-- Make channel_id required after migration
ALTER TABLE public.community_messages 
ALTER COLUMN channel_id SET NOT NULL;

-- Update RLS policy for community_messages to include channel access
DROP POLICY IF EXISTS "Anyone can read messages" ON public.community_messages;
CREATE POLICY "Anyone can read channel messages"
ON public.community_messages
FOR SELECT
USING (true);

-- Update insert policy for community_messages
DROP POLICY IF EXISTS "Authenticated users can insert their own messages" ON public.community_messages;
CREATE POLICY "Authenticated users can insert messages to channels"
ON public.community_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id AND channel_id IS NOT NULL);

-- Add trigger for updated_at on channels
CREATE TRIGGER update_community_channels_updated_at
BEFORE UPDATE ON public.community_channels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();