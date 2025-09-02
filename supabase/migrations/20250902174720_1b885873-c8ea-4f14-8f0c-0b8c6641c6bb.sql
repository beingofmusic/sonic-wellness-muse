-- Fix security vulnerability: Remove public read access to practice_sessions
-- This policy allows anyone to read all user practice data, which is a major privacy/security issue
DROP POLICY IF EXISTS "Users can view basic practice stats from other users" ON public.practice_sessions;

-- Ensure leaderboard functions can still access data via SECURITY DEFINER
-- The existing functions get_alltime_practice_leaderboard(), get_weekly_practice_leaderboard(), 
-- and get_streak_leaderboard() already use SECURITY DEFINER so they will continue to work

-- Verify the remaining policies are secure:
-- 1. "Users can view their own practice sessions" - ✓ Secure (user_id = auth.uid())
-- 2. "Users can create their own practice sessions" - ✓ Secure (auth.uid() = user_id)
-- 3. "Users can update their own practice sessions" - ✓ Secure (user_id = auth.uid())
-- 4. "Users can delete their own practice sessions" - ✓ Secure (user_id = auth.uid())
-- 5. "Users can create practice sessions for accessible routines" - ✓ Secure (proper routine access check)

-- Add a comment to document the security fix
COMMENT ON TABLE public.practice_sessions IS 'Practice session data - access restricted to individual users only for privacy. Aggregate stats available via security definer functions.';