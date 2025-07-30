-- Fix RLS policies for routines to allow access to templates regardless of visibility
-- Drop the existing conflicting policies first
DROP POLICY IF EXISTS "Users can view all templates" ON routines;
DROP POLICY IF EXISTS "Users can view public routines" ON routines;
DROP POLICY IF EXISTS "Users can view public routines and their own routines" ON routines;

-- Create a comprehensive policy that allows users to view:
-- 1. Their own routines (regardless of visibility or template status)
-- 2. Templates (regardless of visibility, as templates should be public by nature)
-- 3. Public routines (that are not private)
CREATE POLICY "Comprehensive routine access" ON routines
  FOR SELECT
  USING (
    auth.uid() = created_by OR  -- Own routines
    is_template = true OR       -- All templates
    visibility = 'public'       -- Public routines
  );