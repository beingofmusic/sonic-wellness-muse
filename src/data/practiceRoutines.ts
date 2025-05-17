
import { PracticeRoutine } from "@/types/practice";

export const myRoutines: PracticeRoutine[] = [
  {
    id: "routine-1",
    title: "baloney paradox",
    description: "predisposition that favors apples",
    duration: 53,
    created_by: "user-1",
    is_template: false,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lastUpdated: "3 days",
    visibility: "private"
  },
  {
    id: "routine-2",
    title: "5-Min Quick Warm-Up (from template)",
    description: "A brief, efficient warm-up for when time is limited",
    duration: 5,
    created_by: "user-1",
    is_template: true,
    tags: ["warm-up", "quick"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lastUpdated: "3 days",
    visibility: "public"
  },
  {
    id: "routine-3",
    title: "trot bgbrervq",
    description: "t3xc qrgtbwrg",
    duration: 23,
    created_by: "user-1",
    is_template: false,
    tags: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lastUpdated: "3 days",
    visibility: "private"
  }
];
