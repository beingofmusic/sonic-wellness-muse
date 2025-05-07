
export interface PracticeTemplate {
  id: string;
  title: string;
  description: string;
  duration: number;
  tags: string[];
  includes: string[];
  usageCount: number;
  creator: string;
  created_by: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface PracticeRoutine {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  created_by: string;
  is_template: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  lastUpdated?: string; // Formatted time for UI display
}

export interface RoutineBlock {
  id: string;
  routine_id: string;
  order_index: number;
  type: string;
  content: string | null;
  duration: number;
  created_at: string;
}
