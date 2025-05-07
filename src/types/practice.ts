
export interface PracticeTemplate {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  tags: string[] | null;
  created_by: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
  
  // Additional UI fields (not in database)
  includes?: string[];
  usageCount?: number;
  creator?: string;
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
  
  // UI display field
  lastUpdated?: string; // Formatted time for UI display
  progress?: number; // Progress through the routine (0-100%)
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

export interface RoutineBlockFormData {
  id?: string;
  type: string;
  content: string;
  duration: number;
  order_index: number;
}

export interface SessionData {
  currentBlockIndex: number;
  timeRemaining: number; // in seconds
  isPaused: boolean;
  isComplete: boolean;
}
