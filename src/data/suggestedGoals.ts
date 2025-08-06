import { GoalCategory } from "@/types/goals";

export interface SuggestedGoal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  targetDays?: number;
  estimatedWeeks?: string;
}

export const suggestedGoals: Record<GoalCategory, SuggestedGoal[]> = {
  Technique: [
    {
      id: "tech-1",
      title: "Master Major Scales",
      description: "Play all 12 major scales fluently at 120 BPM with proper fingering and expression",
      category: "Technique",
      targetDays: 90,
      estimatedWeeks: "8-12 weeks"
    },
    {
      id: "tech-2", 
      title: "Develop Left Hand Independence",
      description: "Achieve smooth coordination between hands through targeted exercises and etudes",
      category: "Technique",
      targetDays: 60,
      estimatedWeeks: "6-8 weeks"
    },
    {
      id: "tech-3",
      title: "Perfect Vibrato Technique",
      description: "Develop consistent, expressive vibrato across all registers and dynamics",
      category: "Technique",
      targetDays: 120,
      estimatedWeeks: "12-16 weeks"
    },
    {
      id: "tech-4",
      title: "Improve Sight-Reading Speed",
      description: "Read and play music at tempo on first sight with 90% accuracy",
      category: "Technique",
      targetDays: 75,
      estimatedWeeks: "8-10 weeks"
    }
  ],
  Performance: [
    {
      id: "perf-1",
      title: "Prepare Recital Program",
      description: "Memorize and polish 4-5 pieces for a 30-minute solo recital performance",
      category: "Performance",
      targetDays: 180,
      estimatedWeeks: "20-24 weeks"
    },
    {
      id: "perf-2",
      title: "Overcome Stage Anxiety",
      description: "Build confidence through performance practice and mental preparation techniques",
      category: "Performance",
      targetDays: 90,
      estimatedWeeks: "10-12 weeks"
    },
    {
      id: "perf-3",
      title: "Master Ensemble Playing",
      description: "Develop skills for playing with others: listening, blending, and following a conductor",
      category: "Performance",
      targetDays: 120,
      estimatedWeeks: "12-16 weeks"
    },
    {
      id: "perf-4",
      title: "Improve Stage Presence",
      description: "Develop confident body language, communication, and audience connection skills",
      category: "Performance",
      targetDays: 60,
      estimatedWeeks: "6-8 weeks"
    }
  ],
  Repertoire: [
    {
      id: "rep-1",
      title: "Learn Classical Masterwork",
      description: "Study and master a significant classical piece from your instrument's core repertoire",
      category: "Repertoire",
      targetDays: 150,
      estimatedWeeks: "16-20 weeks"
    },
    {
      id: "rep-2",
      title: "Explore Jazz Standards",
      description: "Learn 10 essential jazz standards with chord changes and improvisation",
      category: "Repertoire",
      targetDays: 120,
      estimatedWeeks: "12-16 weeks"
    },
    {
      id: "rep-3",
      title: "Contemporary Piece Challenge",
      description: "Learn a modern/contemporary work to expand musical horizons and techniques",
      category: "Repertoire",
      targetDays: 90,
      estimatedWeeks: "10-12 weeks"
    },
    {
      id: "rep-4",
      title: "Build Wedding/Gig Repertoire",
      description: "Prepare 20 popular songs for wedding performances or casual gigs",
      category: "Repertoire",
      targetDays: 60,
      estimatedWeeks: "6-8 weeks"
    }
  ],
  Creativity: [
    {
      id: "crea-1",
      title: "Compose Original Piece",
      description: "Write and notate a complete original composition in your preferred style",
      category: "Creativity",
      targetDays: 90,
      estimatedWeeks: "10-12 weeks"
    },
    {
      id: "crea-2",
      title: "Develop Improvisation Skills",
      description: "Learn to improvise confidently over chord progressions in multiple keys",
      category: "Creativity",
      targetDays: 120,
      estimatedWeeks: "12-16 weeks"
    },
    {
      id: "crea-3",
      title: "Arrange Favorite Song",
      description: "Create an arrangement of a beloved song for your instrument or ensemble",
      category: "Creativity",
      targetDays: 45,
      estimatedWeeks: "4-6 weeks"
    },
    {
      id: "crea-4",
      title: "Write Musical Variations",
      description: "Compose creative variations on a simple theme or folk melody",
      category: "Creativity",
      targetDays: 60,
      estimatedWeeks: "6-8 weeks"
    }
  ],
  Habit: [
    {
      id: "hab-1",
      title: "Daily Practice Routine",
      description: "Establish a consistent 30-45 minute daily practice habit for 100 days",
      category: "Habit",
      targetDays: 100,
      estimatedWeeks: "14-16 weeks"
    },
    {
      id: "hab-2",
      title: "Weekly Performance Practice",
      description: "Record yourself playing once per week to track progress and build confidence",
      category: "Habit",
      targetDays: 84,
      estimatedWeeks: "12 weeks"
    },
    {
      id: "hab-3",
      title: "Morning Warm-up Ritual",
      description: "Create and maintain a 15-minute morning warm-up routine every day",
      category: "Habit",
      targetDays: 30,
      estimatedWeeks: "4-5 weeks"
    },
    {
      id: "hab-4",
      title: "Practice Journal Consistency",
      description: "Write detailed practice notes after every session for 60 days",
      category: "Habit",
      targetDays: 60,
      estimatedWeeks: "8-10 weeks"
    }
  ]
};

export const getRandomGoal = (): SuggestedGoal => {
  const allGoals = Object.values(suggestedGoals).flat();
  const randomIndex = Math.floor(Math.random() * allGoals.length);
  return allGoals[randomIndex];
};