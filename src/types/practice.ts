
export interface PracticeTemplate {
  id: string;
  title: string;
  description: string;
  duration: number;
  tags: string[];
  includes: string[];
  usageCount: number;
  creator: string;
}

export interface PracticeRoutine {
  id: string;
  title: string;
  description: string;
  duration: number;
  lastUpdated: string;
  isTemplate?: boolean;
}
