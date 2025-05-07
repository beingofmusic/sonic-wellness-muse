
import { PracticeTemplate } from "@/types/practice";

export const featuredTemplates: PracticeTemplate[] = [
  {
    id: "template-1",
    title: "5-Min Quick Warm-Up",
    description: "A brief, efficient warm-up for when time is limited",
    duration: 5,
    tags: ["warm-up", "quick", "daily"],
    includes: [
      "1 mindfulness exercise",
      "1 warmup exercise",
      "1 technique exercise"
    ],
    usageCount: 324,
    creator: "Staff"
  },
  {
    id: "template-2",
    title: "Mindful Trumpet Practice",
    description: "Cultivate presence and awareness in your playing",
    duration: 15,
    tags: ["mindfulness", "awareness", "tone", "meditation"],
    includes: [
      "3 mindfulness exercises",
      "1 technique exercise",
      "1 creative exercise"
    ],
    usageCount: 231,
    creator: "Staff"
  },
  {
    id: "template-3",
    title: "High Note Builder",
    description: "Gradually extend your upper register with control",
    duration: 15,
    tags: ["range", "high-notes", "endurance"],
    includes: [
      "2 mindfulness exercises",
      "1 warmup exercise",
      "2 technique exercises"
    ],
    usageCount: 203,
    creator: "Staff"
  }
];
