
-- Function to get practice summary by routine for a user
CREATE OR REPLACE FUNCTION get_routine_practice_summary(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  count BIGINT,
  totalDuration BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    COUNT(ps.id) as count,
    COALESCE(SUM(ps.total_duration), 0) as totalDuration
  FROM 
    practice_sessions ps
  JOIN 
    routines r ON ps.routine_id = r.id
  WHERE 
    ps.user_id = user_id_param
  GROUP BY 
    r.id, r.title
  ORDER BY 
    count DESC, totalDuration DESC;
END;
$$;
