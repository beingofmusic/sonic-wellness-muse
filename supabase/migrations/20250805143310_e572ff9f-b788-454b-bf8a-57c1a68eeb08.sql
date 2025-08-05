-- Update lessons with incorrect YouTube URL format to proper embed format
UPDATE lessons 
SET video_url = 'https://www.youtube.com/embed/' || SUBSTRING(video_url FROM 'v=([^&]*)')
WHERE video_url LIKE '%youtube.com/watch?v=%'
AND video_url NOT LIKE '%youtube.com/embed/%';

-- Update lessons with youtu.be URLs to proper embed format  
UPDATE lessons
SET video_url = 'https://www.youtube.com/embed/' || SUBSTRING(video_url FROM 'youtu.be/([^?]*)')
WHERE video_url LIKE '%youtu.be/%'
AND video_url NOT LIKE '%youtube.com/embed/%';