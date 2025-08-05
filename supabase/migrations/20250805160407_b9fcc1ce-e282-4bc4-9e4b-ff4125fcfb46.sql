-- Fix database function security by adding proper search_path settings

-- Update check_and_award_badges function
CREATE OR REPLACE FUNCTION public.check_and_award_badges(user_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  practice_minutes INTEGER;
  practice_sessions INTEGER;
  current_streak INTEGER;
  completed_courses INTEGER;
  badge_record RECORD;
BEGIN
  -- Get user's practice stats
  SELECT 
    COALESCE(SUM(ps.total_duration), 0) INTO practice_minutes
  FROM 
    practice_sessions ps
  WHERE 
    ps.user_id = user_uuid;
    
  SELECT 
    COUNT(*) INTO practice_sessions
  FROM 
    practice_sessions ps
  WHERE 
    ps.user_id = user_uuid;
    
  -- Get current streak using the existing function but with proper alias to avoid ambiguity
  SELECT 
    COALESCE((SELECT gs.current_streak FROM get_streak_leaderboard() gs WHERE gs.user_id = user_uuid), 0) 
  INTO current_streak;
  
  -- Count completed courses (courses with all lessons completed)
  WITH user_course_progress AS (
    SELECT 
      c.id AS course_id,
      COUNT(DISTINCT l.id) AS total_lessons,
      COUNT(DISTINCT lp.lesson_id) AS completed_lessons
    FROM 
      courses c
    JOIN 
      lessons l ON c.id = l.course_id
    LEFT JOIN 
      lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = user_uuid
    GROUP BY 
      c.id
  )
  SELECT 
    COUNT(*) INTO completed_courses
  FROM 
    user_course_progress
  WHERE 
    total_lessons > 0 AND completed_lessons = total_lessons;
  
  -- Check practice streak badges
  FOR badge_record IN 
    SELECT * FROM badges WHERE condition_type = 'practice_streak'
  LOOP
    IF current_streak >= badge_record.threshold THEN
      -- Award badge if not already awarded
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (user_uuid, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;
  
  -- Check practice minutes badges
  FOR badge_record IN 
    SELECT * FROM badges WHERE condition_type = 'practice_minutes'
  LOOP
    IF practice_minutes >= badge_record.threshold THEN
      -- Award badge if not already awarded
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (user_uuid, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;
  
  -- Check practice sessions badges
  FOR badge_record IN 
    SELECT * FROM badges WHERE condition_type = 'sessions_completed'
  LOOP
    IF practice_sessions >= badge_record.threshold THEN
      -- Award badge if not already awarded
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (user_uuid, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;
  
  -- Check completed courses badges
  FOR badge_record IN 
    SELECT * FROM badges WHERE condition_type = 'courses_completed'
  LOOP
    IF completed_courses >= badge_record.threshold THEN
      -- Award badge if not already awarded
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (user_uuid, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;
  
  -- First practice badge (special case)
  IF practice_sessions > 0 THEN
    INSERT INTO user_badges (user_id, badge_id)
    SELECT user_uuid, id FROM badges WHERE condition_type = 'first_practice'
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
END;
$function$;

-- Update check_and_award_wellness_badges function
CREATE OR REPLACE FUNCTION public.check_and_award_wellness_badges(user_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  wellness_minutes INTEGER;
  wellness_sessions INTEGER;
  journal_entries INTEGER;
  current_streak INTEGER;
  badge_record RECORD;
BEGIN
  -- Get wellness stats
  SELECT 
    ws.total_minutes, ws.total_sessions, ws.total_journal_entries, ws.current_streak
  INTO 
    wellness_minutes, wellness_sessions, journal_entries, current_streak  
  FROM 
    get_wellness_stats(user_uuid) ws;
    
  -- Check wellness streak badges
  INSERT INTO user_badges (user_id, badge_id)
  SELECT 
    user_uuid, b.id
  FROM 
    badges b
  WHERE 
    b.condition_type = 'wellness_streak' AND
    current_streak >= b.threshold AND
    NOT EXISTS (SELECT 1 FROM user_badges ub WHERE ub.user_id = user_uuid AND ub.badge_id = b.id);
    
  -- Check wellness minutes badges
  INSERT INTO user_badges (user_id, badge_id)
  SELECT 
    user_uuid, b.id
  FROM 
    badges b
  WHERE 
    b.condition_type = 'wellness_minutes' AND
    wellness_minutes >= b.threshold AND
    NOT EXISTS (SELECT 1 FROM user_badges ub WHERE ub.user_id = user_uuid AND ub.badge_id = b.id);
    
  -- Check wellness sessions badges
  INSERT INTO user_badges (user_id, badge_id)
  SELECT 
    user_uuid, b.id
  FROM 
    badges b
  WHERE 
    b.condition_type = 'wellness_sessions' AND
    wellness_sessions >= b.threshold AND
    NOT EXISTS (SELECT 1 FROM user_badges ub WHERE ub.user_id = user_uuid AND ub.badge_id = b.id);
    
  -- Check journal entries badges
  INSERT INTO user_badges (user_id, badge_id)
  SELECT 
    user_uuid, b.id
  FROM 
    badges b
  WHERE 
    b.condition_type = 'journal_entries' AND
    journal_entries >= b.threshold AND
    NOT EXISTS (SELECT 1 FROM user_badges ub WHERE ub.user_id = user_uuid AND ub.badge_id = b.id);
END;
$function$;

-- Update get_course_completion function
CREATE OR REPLACE FUNCTION public.get_course_completion(course_uuid uuid, user_uuid uuid)
 RETURNS TABLE(course_id uuid, total_lessons bigint, completed_lessons bigint, completion_percentage integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as course_id,
    COUNT(DISTINCT l.id)::BIGINT as total_lessons,
    COUNT(DISTINCT lp.lesson_id)::BIGINT as completed_lessons,
    CASE
      WHEN COUNT(DISTINCT l.id) = 0 THEN 0
      ELSE (COUNT(DISTINCT lp.lesson_id) * 100 / COUNT(DISTINCT l.id))::INTEGER
    END as completion_percentage
  FROM 
    courses c
  LEFT JOIN 
    lessons l ON c.id = l.course_id
  LEFT JOIN 
    lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = user_uuid
  WHERE 
    c.id = course_uuid
  GROUP BY 
    c.id;
END;
$function$;

-- Update get_featured_templates function
CREATE OR REPLACE FUNCTION public.get_featured_templates(limit_count integer DEFAULT 3)
 RETURNS TABLE(id uuid, title text, description text, duration integer, tags text[], created_by uuid, is_template boolean, created_at timestamp with time zone, updated_at timestamp with time zone, visibility text, creator_name text, includes text[], usage_count integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    r.id, 
    r.title, 
    r.description, 
    r.duration, 
    r.tags,
    r.created_by,
    r.is_template,
    r.created_at,
    r.updated_at,
    r.visibility,
    COALESCE(p.first_name || ' ' || p.last_name, 'Team member') as creator_name,
    ARRAY['Warm-up exercise', 'Technical drill', 'Mindfulness practice']::text[] as includes,
    floor(random() * 500)::integer as usage_count -- Placeholder for now
  FROM 
    routines r
  LEFT JOIN
    profiles p ON r.created_by = p.id
  WHERE 
    (r.is_template = true OR r.visibility = 'public')
  ORDER BY 
    r.created_at DESC
  LIMIT 
    limit_count;
END;
$function$;

-- Update get_user_courses_with_progress function
CREATE OR REPLACE FUNCTION public.get_user_courses_with_progress(user_uuid uuid)
 RETURNS TABLE(id uuid, title text, description text, instructor text, thumbnail_url text, tags text[], created_at timestamp with time zone, total_lessons bigint, completed_lessons bigint, completion_percentage integer, last_interaction timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH user_lessons AS (
    -- Get all lessons that the user has completed
    SELECT 
      lp.lesson_id,
      lp.completed_at,
      l.course_id
    FROM 
      lesson_progress lp
    JOIN 
      lessons l ON lp.lesson_id = l.id
    WHERE 
      lp.user_id = user_uuid
  ),
  course_stats AS (
    -- Calculate statistics for each course the user has interacted with
    SELECT 
      c.id,
      c.title,
      c.description,
      c.instructor,
      c.thumbnail_url,
      c.tags,
      c.created_at,
      COUNT(DISTINCT l.id) AS total_lessons,
      COUNT(DISTINCT ul.lesson_id) AS completed_lessons,
      CASE
        WHEN COUNT(DISTINCT l.id) = 0 THEN 0
        ELSE (COUNT(DISTINCT ul.lesson_id) * 100 / COUNT(DISTINCT l.id))::INTEGER
      END AS completion_percentage,
      MAX(ul.completed_at) AS last_interaction
    FROM 
      courses c
    LEFT JOIN 
      lessons l ON c.id = l.course_id
    LEFT JOIN 
      user_lessons ul ON c.id = ul.course_id
    GROUP BY 
      c.id, c.title, c.description, c.instructor, c.thumbnail_url, c.tags, c.created_at
    HAVING 
      COUNT(DISTINCT ul.lesson_id) > 0  -- Only include courses the user has started
  )
  SELECT *
  FROM course_stats
  ORDER BY last_interaction DESC  -- Order by most recently interacted
  LIMIT 10;  -- Get more than we need for the dashboard, client will trim to 3
END;
$function$;

-- Update get_wellness_stats function
CREATE OR REPLACE FUNCTION public.get_wellness_stats(user_uuid uuid)
 RETURNS TABLE(total_sessions bigint, total_minutes bigint, current_streak integer, total_journal_entries bigint, weekly_minutes_goal integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_date DATE := CURRENT_DATE;
  streak INTEGER := 0;
  dates DATE[];
BEGIN
  -- Get user's wellness goal (default to 60 if not set)
  weekly_minutes_goal := (
    SELECT COALESCE((SELECT wg.weekly_minutes_goal FROM wellness_goals wg WHERE wg.user_id = user_uuid), 60)
  );
  
  -- Get total number of sessions
  total_sessions := (
    SELECT COUNT(*) FROM wellness_sessions ws WHERE ws.user_id = user_uuid
  );
  
  -- Get total minutes practiced
  total_minutes := (
    SELECT COALESCE(SUM(ws.duration_minutes), 0) FROM wellness_sessions ws WHERE ws.user_id = user_uuid
  );
  
  -- Count journal entries
  total_journal_entries := (
    SELECT COUNT(*) FROM journal_entries je WHERE je.user_id = user_uuid
  );
  
  -- Calculate current streak (consecutive days with wellness activity)
  SELECT ARRAY(
    SELECT DISTINCT DATE(completed_at)
    FROM (
      SELECT completed_at FROM wellness_sessions WHERE user_id = user_uuid
      UNION ALL
      SELECT created_at FROM journal_entries WHERE user_id = user_uuid
    ) activities
    ORDER BY DATE(completed_at) DESC
  ) INTO dates;
  
  -- Check streak
  IF array_length(dates, 1) IS NOT NULL THEN
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
  
  current_streak := streak;
  
  RETURN NEXT;
END;
$function$;