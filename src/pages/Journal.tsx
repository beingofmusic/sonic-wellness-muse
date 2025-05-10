
import React from "react";
import { Layout } from "@/components/Layout";
import { useJournalProgress } from "@/hooks/useJournal";
import JournalSectionCard from "@/components/journal/JournalSectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, BookMarked, BookOpenCheck } from "lucide-react";

const Journal: React.FC = () => {
  const { data: progress, isLoading } = useJournalProgress();

  const sectionDescriptions = {
    past: "Reflect on your musical origins, milestones, struggles, and patterns that have shaped your journey.",
    present: "Assess your current skills, habits, environment, and examine what's serving you and what's holding you back.",
    future: "Define your vision, set goals, anticipate obstacles, and commit to your path forward."
  };

  const sectionTitles = {
    past: "Past Authoring",
    present: "Present Authoring",
    future: "Future Authoring"
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-music-primary" />
            <h1 className="text-3xl font-semibold">Musical Self-Composition Suite</h1>
          </div>
          <p className="text-white/70 mb-8 max-w-3xl">
            Engage in structured self-reflection to understand your musical journey, 
            assess your current abilities, and chart your future development as a musician.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-72">
                    <Skeleton className="h-full w-full" />
                  </div>
                ))}
              </>
            ) : progress && progress.length > 0 ? (
              <>
                {['past', 'present', 'future'].map((section) => {
                  const sectionProgress = progress.find(p => p.section === section) || {
                    section: section as any,
                    total_prompts: 0,
                    completed_prompts: 0,
                    completion_percentage: 0
                  };
                  
                  return (
                    <JournalSectionCard
                      key={section}
                      title={sectionTitles[section as keyof typeof sectionTitles]}
                      description={sectionDescriptions[section as keyof typeof sectionDescriptions]}
                      section={section as any}
                      totalPrompts={sectionProgress.total_prompts}
                      completedPrompts={sectionProgress.completed_prompts}
                      completionPercentage={sectionProgress.completion_percentage}
                    />
                  );
                })}
              </>
            ) : (
              <div className="col-span-3 text-center py-10 border border-dashed border-white/10 rounded-lg">
                <BookMarked className="h-8 w-8 mx-auto mb-2 text-white/40" />
                <p>No journal sections available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Journal;
