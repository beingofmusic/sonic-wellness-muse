
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail_url: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  video_url: string;
  pdf_url: string | null;
  summary: string;
  order_index: number;
  created_at: string;
  completed?: boolean;
}

export interface CourseWithProgress extends Course {
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
}
