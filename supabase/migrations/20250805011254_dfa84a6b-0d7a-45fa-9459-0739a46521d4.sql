-- Create storage bucket for practice recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('practice_recordings', 'practice_recordings', true);

-- Create practice recordings table
CREATE TABLE public.practice_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.practice_sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  recording_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  duration_seconds INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS on practice recordings
ALTER TABLE public.practice_recordings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for practice recordings
CREATE POLICY "Users can view their own recordings" 
ON public.practice_recordings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recordings" 
ON public.practice_recordings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recordings" 
ON public.practice_recordings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recordings" 
ON public.practice_recordings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Storage policies for practice recordings
CREATE POLICY "Users can view their own recordings" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'practice_recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own recordings" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'practice_recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own recordings" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'practice_recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own recordings" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'practice_recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create index for better performance
CREATE INDEX idx_practice_recordings_user_id ON public.practice_recordings(user_id);
CREATE INDEX idx_practice_recordings_created_at ON public.practice_recordings(created_at DESC);