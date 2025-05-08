
-- Function to get weekly practice leaderboard with corrected column references
CREATE OR REPLACE FUNCTION get_weekly_practice_leaderboard(
  week_start TIMESTAMP WITH TIME ZONE,
  week_end TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  total_minutes BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.first_name,
    p.last_name,
    p.avatar_url,
    COALESCE(SUM(ps.total_duration), 0) as total_minutes
  FROM 
    profiles p
  LEFT JOIN 
    practice_sessions ps ON p.id = ps.user_id
      AND ps.completed_at >= week_start
      AND ps.completed_at <= week_end
  GROUP BY 
    p.id, p.username, p.first_name, p.last_name, p.avatar_url
  HAVING 
    COALESCE(SUM(ps.total_duration), 0) > 0
  ORDER BY 
    total_minutes DESC;
END;
$$;

-- Function to get all-time practice leaderboard with corrected column references
CREATE OR REPLACE FUNCTION get_alltime_practice_leaderboard()
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  total_minutes BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.first_name,
    p.last_name,
    p.avatar_url,
    COALESCE(SUM(ps.total_duration), 0) as total_minutes
  FROM 
    profiles p
  LEFT JOIN 
    practice_sessions ps ON p.id = ps.user_id
  GROUP BY 
    p.id, p.username, p.first_name, p.last_name, p.avatar_url
  HAVING 
    COALESCE(SUM(ps.total_duration), 0) > 0
  ORDER BY 
    total_minutes DESC;
END;
$$;

-- Function to get streak leaderboard with explicit column references
CREATE OR REPLACE FUNCTION get_streak_leaderboard()
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  current_streak INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  dates DATE[];
  practice_date DATE;
  streak INTEGER;
  current_date DATE := CURRENT_DATE;
BEGIN
  -- Create temporary table to store results
  CREATE TEMPORARY TABLE IF NOT EXISTS temp_streaks (
    user_id UUID,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    current_streak INTEGER
  ) ON COMMIT DROP;
  
  -- Process each user
  FOR user_record IN SELECT p.id, p.username, p.first_name, p.last_name, p.avatar_url FROM profiles p
  LOOP
    -- Get distinct practice dates for this user
    SELECT ARRAY(
      SELECT DISTINCT DATE(completed_at)
      FROM practice_sessions
      WHERE user_id = user_record.id
      ORDER BY DATE(completed_at) DESC
    ) INTO dates;
    
    -- Calculate streak
    streak := 0;
    
    -- Check if user has any practice sessions
    IF array_length(dates, 1) IS NOT NULL THEN
      -- Start with most recent practice date
      IF dates[1] = current_date OR dates[1] = current_date - 1 THEN
        streak := 1;
        
        -- Check consecutive days
        FOR i IN 1..array_length(dates, 1)-1 LOOP
          IF dates[i] - dates[i+1] = 1 THEN
            streak := streak + 1;
          ELSE
            EXIT;
          END IF;
        END LOOP;
      END IF;
    END IF;
    
    -- Insert result for this user
    IF streak > 0 THEN
      INSERT INTO temp_streaks (user_id, username, first_name, last_name, avatar_url, current_streak)
      VALUES (user_record.id, user_record.username, user_record.first_name, user_record.last_name, user_record.avatar_url, streak);
    END IF;
  END LOOP;
  
  -- Return results
  RETURN QUERY
  SELECT * FROM temp_streaks
  ORDER BY current_streak DESC;
END;
$$;
