-- Allow users to view basic practice statistics from other users for leaderboards and profiles
CREATE POLICY "Users can view basic practice stats from other users"
ON practice_sessions
FOR SELECT
USING (true);

-- Allow users to view earned badges from other users for profile viewing and community recognition
CREATE POLICY "Users can view badges from other users"
ON user_badges
FOR SELECT
USING (true);