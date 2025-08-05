-- Create loop_trainer_sessions table for the new Loop Trainer practice tool
CREATE TABLE public.loop_trainer_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  youtube_url TEXT NOT NULL,
  video_title TEXT,
  start_time_sec INTEGER NOT NULL DEFAULT 0,
  end_time_sec INTEGER NOT NULL,
  playback_speed DECIMAL(3,2) NOT NULL DEFAULT 1.00 CHECK (playback_speed >= 0.25 AND playback_speed <= 2.00),
  pitch_shift INTEGER NOT NULL DEFAULT 0 CHECK (pitch_shift >= -12 AND pitch_shift <= 12),
  loop_count INTEGER NOT NULL DEFAULT 0,
  total_practice_time INTEGER NOT NULL DEFAULT 0, -- in seconds
  session_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.loop_trainer_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for loop trainer sessions
CREATE POLICY "Users can view their own loop trainer sessions" 
ON public.loop_trainer_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loop trainer sessions" 
ON public.loop_trainer_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loop trainer sessions" 
ON public.loop_trainer_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loop trainer sessions" 
ON public.loop_trainer_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_loop_trainer_sessions_updated_at
BEFORE UPDATE ON public.loop_trainer_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_loop_trainer_sessions_user_id ON public.loop_trainer_sessions(user_id);
CREATE INDEX idx_loop_trainer_sessions_created_at ON public.loop_trainer_sessions(created_at DESC);