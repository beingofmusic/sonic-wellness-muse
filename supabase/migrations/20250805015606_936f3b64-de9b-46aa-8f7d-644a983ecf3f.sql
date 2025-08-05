-- Update practice_recordings to link them to practice_sessions based on timestamp proximity
-- This will help retroactively link existing recordings that have session_id as null

UPDATE practice_recordings
SET session_id = ps.id
FROM practice_sessions ps
WHERE practice_recordings.session_id IS NULL
  AND practice_recordings.user_id = ps.user_id
  AND ABS(EXTRACT(EPOCH FROM (practice_recordings.created_at - ps.completed_at))) <= 300; -- 5 minutes tolerance