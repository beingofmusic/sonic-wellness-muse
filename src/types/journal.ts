
export type JournalSectionType = 'past' | 'present' | 'future';

export interface JournalPrompt {
  id: string;
  section: JournalSectionType;
  order_index: number;
  title: string;
  description: string;
  prompt_text: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  prompt_id: string;
  content: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  prompt?: JournalPrompt;
}

export interface SectionProgress {
  section: JournalSectionType;
  total_prompts: number;
  completed_prompts: number;
  completion_percentage: number;
}
