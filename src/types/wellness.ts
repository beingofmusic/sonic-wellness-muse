
export interface WellnessPractice {
  id: string;
  title: string;
  description: string;
  type: 'meditation' | 'breathwork' | 'yoga_fitness';
  duration_minutes: number;
  content: string;
  image_url: string | null;
}

export interface JournalPrompt {
  id: string;
  title: string;
  description: string;
  type: 'self_composition' | 'values' | 'resistance' | 'learning';
  duration_minutes: number;
  prompt_text: string;
}

export interface WellnessStats {
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  total_journal_entries: number;
  weekly_minutes_goal: number;
}

export interface WellnessSession {
  id: string;
  user_id: string;
  practice_id: string;
  duration_minutes: number;
  completed_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  prompt_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface WellnessGoal {
  id: string;
  user_id: string;
  weekly_minutes_goal: number;
}
