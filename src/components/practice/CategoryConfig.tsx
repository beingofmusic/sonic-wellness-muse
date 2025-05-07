
import React from "react";
import { Guitar, Headphones, Mic, MicOff, Drum } from "lucide-react";

export const CATEGORIES = [
  { id: "warmup", name: "Warm-up", icon: <Mic className="h-4 w-4 text-orange-400" /> },
  { id: "technique", name: "Technique", icon: <Guitar className="h-4 w-4 text-music-primary" /> },
  { id: "mindfulness", name: "Mindfulness", icon: <Headphones className="h-4 w-4 text-blue-400" /> },
  { id: "creative", name: "Creative", icon: <Drum className="h-4 w-4 text-green-400" /> },
  { id: "cooldown", name: "Cool-down", icon: <MicOff className="h-4 w-4 text-purple-400" /> },
];

export const getCategoryColorClass = (category: string): string => {
  switch (category) {
    case "warmup": return "border-l-orange-400 from-orange-500/5 to-orange-500/10";
    case "technique": return "border-l-music-primary from-music-primary/5 to-music-primary/10";
    case "mindfulness": return "border-l-blue-400 from-blue-500/5 to-blue-500/10";
    case "creative": return "border-l-green-400 from-green-500/5 to-green-500/10";
    case "cooldown": return "border-l-purple-400 from-purple-500/5 to-purple-500/10";
    default: return "border-l-gray-400";
  }
};

export const getCategoryIcon = (category: string) => {
  const categoryConfig = CATEGORIES.find(c => c.id === category);
  return categoryConfig?.icon || null;
};
