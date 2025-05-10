
export type GoalCategory = 'Technique' | 'Performance' | 'Repertoire' | 'Creativity' | 'Habit';

export interface PracticeGoal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  progress: number;
  targetDate: string | null;
  createdAt: string;
  userId: string;
  isCompleted: boolean;
}

export interface CreateGoalData {
  title: string;
  description: string;
  category: GoalCategory;
  progress: number;
  targetDate: string | null;
}
