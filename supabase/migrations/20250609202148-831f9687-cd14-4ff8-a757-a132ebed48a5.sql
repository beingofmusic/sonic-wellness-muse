
-- First, let's check if we have proper RLS policies for public routines
-- We need to allow users to view public routines even if they didn't create them

-- Check current policies on routines table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'routines';

-- If no proper policies exist, create them
-- Allow users to view public routines or their own routines
DROP POLICY IF EXISTS "Users can view public routines and their own routines" ON public.routines;
CREATE POLICY "Users can view public routines and their own routines" 
  ON public.routines 
  FOR SELECT 
  TO authenticated
  USING (
    visibility = 'public' OR 
    created_by = auth.uid()
  );

-- Allow users to view public routine blocks or blocks from their own routines
DROP POLICY IF EXISTS "Users can view blocks from public routines or their own routines" ON public.routine_blocks;
CREATE POLICY "Users can view blocks from public routines or their own routines" 
  ON public.routine_blocks 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.routines r 
      WHERE r.id = routine_blocks.routine_id 
      AND (r.visibility = 'public' OR r.created_by = auth.uid())
    )
  );

-- Allow users to create practice sessions for public routines or their own routines
DROP POLICY IF EXISTS "Users can create practice sessions for accessible routines" ON public.practice_sessions;
CREATE POLICY "Users can create practice sessions for accessible routines" 
  ON public.practice_sessions 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND (
      routine_id IS NULL OR 
      EXISTS (
        SELECT 1 FROM public.routines r 
        WHERE r.id = routine_id 
        AND (r.visibility = 'public' OR r.created_by = auth.uid())
      )
    )
  );

-- Allow users to view their own practice sessions
DROP POLICY IF EXISTS "Users can view their own practice sessions" ON public.practice_sessions;
CREATE POLICY "Users can view their own practice sessions" 
  ON public.practice_sessions 
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to update their own practice sessions
DROP POLICY IF EXISTS "Users can update their own practice sessions" ON public.practice_sessions;
CREATE POLICY "Users can update their own practice sessions" 
  ON public.practice_sessions 
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to delete their own practice sessions  
DROP POLICY IF EXISTS "Users can delete their own practice sessions" ON public.practice_sessions;
CREATE POLICY "Users can delete their own practice sessions" 
  ON public.practice_sessions 
  FOR DELETE 
  TO authenticated
  USING (user_id = auth.uid());
