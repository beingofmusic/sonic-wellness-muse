-- Allow users to view basic profile information of other users for community features
-- This is needed so that chat messages can display sender names
CREATE POLICY "Users can view basic profile info of other users for community"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);