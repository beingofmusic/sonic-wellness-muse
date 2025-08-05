export interface PracticeRecording {
  id: string;
  user_id: string;
  session_id: string | null;
  title: string;
  recording_url: string;
  created_at: string;
  notes: string | null;
  tags: string[];
  duration_seconds: number;
}

export interface RecordingFormData {
  title: string;
  notes?: string;
  tags: string[];
}