import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, Clock, Target, BookOpen } from "lucide-react";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import { useGoals } from "@/hooks/useGoals";
import { useUserRoutines } from "@/hooks/useUserRoutines";
import { CreateRoutineButton } from "@/components/practice/CreateRoutineModal";

const QuickStartWidget: React.FC = () => {
  const { stats, isLoading: statsLoading } = usePracticeStats();
  const { goals } = useGoals();
  const { routines } = useUserRoutines(1);

  const hasRoutine = routines && routines.length > 0;
  const lastRoutine = hasRoutine ? routines[0] : null;
  const hasGoals = goals && goals.length > 0;
  const isNewUser = !statsLoading && stats.sessionCount === 0;

  return (
    <Card className="p-5 md:p-6 bg-gradient-to-br from-card/90 to-card/70 border-white/10 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Quick Start</h2>
          <p className="text-sm text-white/60">Jump right in with a recommended next step</p>
        </div>
        <Link to="/practice/history">
          <Button variant="outline" size="sm" className="border-white/10 bg-white/5 hover:bg-white/10">
            <Clock className="h-4 w-4 mr-1" />
            History
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {hasRoutine && (
          <Link to={`/practice/routine/${lastRoutine!.id}`} className="group">
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 hover:border-primary/40 transition-all hover-scale">
              <div className="flex items-center gap-2 mb-1">
                <Play className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Continue routine</span>
              </div>
              <p className="text-xs text-white/60 line-clamp-1">{lastRoutine!.title}</p>
            </div>
          </Link>
        )}

        {isNewUser && (
          <Link to="/practice/routine/open-practice" className="group">
            <div className="rounded-lg border border-accent/20 bg-accent/10 p-4 hover:border-accent/40 transition-all hover-scale">
              <div className="flex items-center gap-2 mb-1">
                <Play className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Start open practice</span>
              </div>
              <p className="text-xs text-white/60">Quick timer and tools</p>
            </div>
          </Link>
        )}

        {hasGoals && (
          <Link to="/practice" className="group">
            <div className="rounded-lg border border-secondary/20 bg-secondary/10 p-4 hover:border-secondary/40 transition-all hover-scale">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">Work on a goal</span>
              </div>
              <p className="text-xs text-white/60">View your current goals</p>
            </div>
          </Link>
        )}

        <Link to="/practice/templates" className="group">
          <div className="rounded-lg border border-secondary/20 bg-secondary/10 p-4 hover:border-secondary/40 transition-all hover-scale">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Explore routines</span>
            </div>
            <p className="text-xs text-white/60">Guided templates library</p>
          </div>
        </Link>

        <div className="group">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all hover-scale">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Create a routine</span>
            </div>
            <CreateRoutineButton variant="outline" className="w-full" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default QuickStartWidget;
