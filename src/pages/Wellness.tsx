
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import WellnessStatsCard from "@/components/wellness/WellnessStatsCard";
import WellnessPracticeCard from "@/components/wellness/WellnessPracticeCard";
import JournalPromptCard from "@/components/wellness/JournalPromptCard";
import FilterChips from "@/components/wellness/FilterChips";
import WellnessSetGoalDialog from "@/components/wellness/WellnessSetGoalDialog";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Flame, 
  Feather, 
  Dumbbell, 
  Music, 
  Pencil,
  Target
} from "lucide-react";
import { useWellnessStats, useWellnessPractices, useJournalPrompts } from "@/hooks/useWellness";
import { Skeleton } from "@/components/ui/skeleton";

const Wellness: React.FC = () => {
  const [practiceFilter, setPracticeFilter] = useState<string>("all");
  const [journalFilter, setJournalFilter] = useState<string>("all");
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  
  const { data: stats, isLoading: statsLoading } = useWellnessStats();
  const { data: practices, isLoading: practicesLoading } = useWellnessPractices(practiceFilter);
  const { data: prompts, isLoading: promptsLoading } = useJournalPrompts(journalFilter);

  const practiceFilters = [
    { value: "all", label: "All Practices" },
    { value: "meditation", label: "Meditation" },
    { value: "breathwork", label: "Breathwork" },
    { value: "yoga_fitness", label: "Yoga & Fitness" }
  ];

  const journalFilters = [
    { value: "all", label: "All Prompts" },
    { value: "self_composition", label: "Self Composition" },
    { value: "values", label: "Values" },
    { value: "resistance", label: "Resistance" },
    { value: "learning", label: "Learning" }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Wellness Hub</h1>
            <p className="text-white/70">
              Nurture your well-being with mindfulness practices and reflective journaling
            </p>
          </div>
          <Button 
            onClick={() => setIsGoalDialogOpen(true)}
            variant="outline"
            className="hidden md:flex items-center gap-2 bg-music-primary/5 border-music-primary/20 hover:bg-music-primary/10"
          >
            <Target className="h-4 w-4" />
            Set Weekly Goal
          </Button>
        </div>

        {/* Stats Dashboard */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Wellness Stats</h2>
            <Button 
              onClick={() => setIsGoalDialogOpen(true)}
              variant="outline"
              className="md:hidden"
            >
              <Target className="h-4 w-4 mr-2" />
              Set Goal
            </Button>
          </div>
          <WellnessStatsCard stats={stats || null} isLoading={statsLoading} />
        </div>

        {/* Guided Practices */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-music-primary" />
            <h2 className="text-2xl font-semibold">Guided Practices</h2>
          </div>
          
          <FilterChips 
            options={practiceFilters} 
            selectedValue={practiceFilter} 
            onChange={setPracticeFilter}
          />
          
          {practicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80">
                  <Skeleton className="h-full w-full" />
                </div>
              ))}
            </div>
          ) : practices && practices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practices.map((practice) => (
                <WellnessPracticeCard key={practice.id} practice={practice} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-white/10 rounded-lg">
              <Music className="h-8 w-8 mx-auto mb-2 text-white/40" />
              <p>No practices available for the selected filter</p>
            </div>
          )}
        </div>

        {/* Guided Journaling */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-music-primary" />
            <h2 className="text-2xl font-semibold">Guided Journaling</h2>
          </div>
          
          <FilterChips 
            options={journalFilters} 
            selectedValue={journalFilter} 
            onChange={setJournalFilter}
          />
          
          {promptsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64">
                  <Skeleton className="h-full w-full" />
                </div>
              ))}
            </div>
          ) : prompts && prompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.map((prompt) => (
                <JournalPromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-white/10 rounded-lg">
              <Pencil className="h-8 w-8 mx-auto mb-2 text-white/40" />
              <p>No journal prompts available for the selected filter</p>
            </div>
          )}
        </div>
        
        {/* Set Goal Dialog */}
        {stats && (
          <WellnessSetGoalDialog 
            open={isGoalDialogOpen}
            onOpenChange={setIsGoalDialogOpen}
            currentGoal={stats.weekly_minutes_goal}
          />
        )}
      </div>
    </Layout>
  );
};

export default Wellness;
