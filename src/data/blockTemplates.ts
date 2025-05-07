
import { BlockFormValues } from "@/schemas/routineSchema";

type BlockTemplate = {
  id: string;
  title: string;
  type: string;
  content: string;
  duration: number;
  category: "warmup" | "technique" | "mindfulness" | "creative" | "cooldown";
};

export const blockTemplates: BlockTemplate[] = [
  // Warm-up templates
  {
    id: "warmup-1",
    title: "Breathing Exercise",
    type: "warmup",
    content: "Take 10 deep breaths, focusing on expanding your diaphragm. Inhale for 4 counts, hold for 4, exhale for 8.",
    duration: 3,
    category: "warmup"
  },
  {
    id: "warmup-2",
    title: "Vocal Warm-up",
    type: "warmup",
    content: "Start with lip trills, gentle humming on middle C, then move to 5-note scales on 'ah' vowels.",
    duration: 5,
    category: "warmup"
  },
  {
    id: "warmup-3",
    title: "Finger Stretches",
    type: "warmup",
    content: "Stretch each finger gently, rotate wrists, and practice slow finger exercises with light pressure.",
    duration: 2,
    category: "warmup"
  },
  
  // Technique templates
  {
    id: "tech-1",
    title: "Scale Patterns",
    type: "technique",
    content: "Practice G major scale in thirds, then in broken thirds. Focus on evenness and clarity.",
    duration: 10,
    category: "technique"
  },
  {
    id: "tech-2",
    title: "Rhythm Exercise",
    type: "technique",
    content: "Practice eighth note and triplet patterns with metronome set to 60 BPM. Gradually increase speed.",
    duration: 8,
    category: "technique"
  },
  {
    id: "tech-3",
    title: "Articulation Study",
    type: "technique",
    content: "Practice legato, staccato, and marcato articulations on a simple melody. Focus on clear transitions between styles.",
    duration: 7,
    category: "technique"
  },
  
  // Mindfulness templates
  {
    id: "mind-1",
    title: "Active Listening",
    type: "mindfulness",
    content: "Listen to a reference recording of your current piece, noting three specific elements you want to incorporate.",
    duration: 5,
    category: "mindfulness"
  },
  {
    id: "mind-2",
    title: "Visualization",
    type: "mindfulness",
    content: "Close your eyes and mentally perform your piece from memory, imagining perfect execution and emotional expression.",
    duration: 4,
    category: "mindfulness"
  },
  {
    id: "mind-3",
    title: "Body Scan",
    type: "mindfulness",
    content: "Perform a body scan while in playing position to identify and release tension in shoulders, neck, hands, and jaw.",
    duration: 3,
    category: "mindfulness"
  },
  
  // Creative templates
  {
    id: "creative-1",
    title: "Improvisation",
    type: "creative",
    content: "Improvise over a simple chord progression using only 3-5 notes. Focus on rhythm and space rather than complexity.",
    duration: 8,
    category: "creative"
  },
  {
    id: "creative-2",
    title: "Melody Creation",
    type: "creative",
    content: "Compose a simple 4-bar melody based on a mood or image. Try variations in different registers.",
    duration: 6,
    category: "creative"
  },
  {
    id: "creative-3",
    title: "Story Through Sound",
    type: "creative",
    content: "Create a musical narrative with a beginning, climax, and resolution using dynamics, tempo, and articulation.",
    duration: 7,
    category: "creative"
  },
  
  // Cool-down templates
  {
    id: "cooldown-1",
    title: "Long Tones",
    type: "cooldown",
    content: "Play 5 long, soft tones focusing on consistent tone quality and smooth releases.",
    duration: 4,
    category: "cooldown"
  },
  {
    id: "cooldown-2",
    title: "Gentle Stretches",
    type: "cooldown",
    content: "Perform gentle stretches for hands, arms, neck, and back to release any built-up tension.",
    duration: 3,
    category: "cooldown"
  },
  {
    id: "cooldown-3",
    title: "Practice Reflection",
    type: "cooldown",
    content: "Write 3 specific observations from today's practice and set one clear intention for tomorrow's session.",
    duration: 5,
    category: "cooldown"
  }
];

export const getTemplatesByCategory = (category: string) => {
  return blockTemplates.filter(template => template.category === category);
};

export const getBlockTemplate = (id: string): BlockTemplate | undefined => {
  return blockTemplates.find(template => template.id === id);
};
