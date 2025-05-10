
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpenCheck, BookMarked, BookOpen } from "lucide-react";
import { useJournalPrompts, useJournalEntries } from "@/hooks/useJournal";
import { JournalSectionType } from "@/types/journal";
import { Skeleton } from "@/components/ui/skeleton";
import JournalPromptCard from "@/components/journal/JournalPromptCard";

const JournalSection: React.FC = () => {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  
  const { data: prompts, isLoading: isLoadingPrompts } = useJournalPrompts(section as JournalSectionType);
  const { data: entries, isLoading: isLoadingEntries } = useJournalEntries();
  
  const getSectionTitle = () => {
    switch (section) {
      case "past": return "Past Authoring";
      case "present": return "Present Authoring";
      case "future": return "Future Authoring";
      default: return "Journal";
    }
  };
  
  const getSectionDescription = () => {
    switch (section) {
      case "past": return "Reflect on your musical journey, origins, and key experiences that shaped you.";
      case "present": return "Examine your current abilities, patterns, and environment as a musician.";
      case "future": return "Chart your path forward with clear goals, strategies, and commitments.";
      default: return "";
    }
  };
  
  const getSectionIcon = () => {
    switch (section) {
      case "past": return <BookMarked className="h-5 w-5 text-yellow-500" />;
      case "present": return <BookOpen className="h-5 w-5 text-blue-500" />;
      case "future": return <BookOpenCheck className="h-5 w-5 text-emerald-500" />;
      default: return <BookOpen className="h-5 w-5 text-music-primary" />;
    }
  };
  
  const isLoading = isLoadingPrompts || isLoadingEntries;
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/journal')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Journal
          </Button>
          
          <div className="flex items-center gap-2 mb-2">
            {getSectionIcon()}
            <h1 className="text-3xl font-semibold">{getSectionTitle()}</h1>
          </div>
          
          <p className="text-white/70 mb-8 max-w-3xl">
            {getSectionDescription()}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64">
                    <Skeleton className="h-full w-full" />
                  </div>
                ))}
              </>
            ) : prompts && prompts.length > 0 ? (
              <>
                {prompts.map((prompt, index) => {
                  const entry = entries?.find(e => e.prompt_id === prompt.id);
                  const isCompleted = !!entry?.is_completed;
                  const hasStarted = !!entry && !isCompleted;
                  
                  return (
                    <JournalPromptCard
                      key={prompt.id}
                      prompt={prompt}
                      isCompleted={isCompleted}
                      hasStarted={hasStarted}
                      order={index + 1}
                    />
                  );
                })}
              </>
            ) : (
              <div className="col-span-3 text-center py-10 border border-dashed border-white/10 rounded-lg">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-white/40" />
                <p>No prompts available for this section</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JournalSection;
