import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Rocket, Play, BookOpen, Target } from "lucide-react";
import { useQuickStartSuggestions } from "@/hooks/useQuickStartSuggestions";

const iconMap: Record<string, React.ReactNode> = {
  guided: <Rocket className="h-4 w-4" />,
  "create-first": <Target className="h-4 w-4" />,
  "browse-courses": <BookOpen className="h-4 w-4" />,
  "continue-routine": <Play className="h-4 w-4" />,
  "open-practice": <Play className="h-4 w-4" />,
  "continue-course": <BookOpen className="h-4 w-4" />,
  "discover-course": <BookOpen className="h-4 w-4" />,
  "try-new-routine": <Rocket className="h-4 w-4" />,
};

const QuickStartWidget: React.FC = () => {
  const { suggestions, isLoading } = useQuickStartSuggestions();

  return (
    <section aria-label="Quick start recommendations">
      <div className="p-4 rounded-xl border border-white/10 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-medium">Quick Start</h2>
          <span className="text-xs text-white/60">Personalized next steps</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Skeleton className="h-24 rounded-lg bg-white/5" />
            <Skeleton className="h-24 rounded-lg bg-white/5" />
            <Skeleton className="h-24 rounded-lg bg-white/5" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestions.slice(0, 3).map((s) => (
              <article key={s.id} className="rounded-lg border border-white/10 bg-background/60 p-3">
                <h3 className="text-sm font-semibold mb-1 line-clamp-1">{s.title}</h3>
                <p className="text-xs text-white/70 mb-2 line-clamp-2">{s.description}</p>
                <div className="flex justify-between items-center">
                  <Link to={s.href} className="flex-1">
                    <Button size="sm" className="w-full music-button">
                      <span className="mr-2">{iconMap[s.id] ?? <Play className="h-4 w-4" />}</span>
                      {s.ctaLabel}
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default QuickStartWidget;
