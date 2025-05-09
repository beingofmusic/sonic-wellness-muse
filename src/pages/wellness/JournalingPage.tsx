
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Clock, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchJournalPromptById } from '@/services/wellnessService';
import { useSaveJournalEntry } from '@/hooks/useWellness';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const JournalingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveJournal = useSaveJournalEntry();

  // Fetch prompt details
  const { data: prompt, isLoading } = useQuery({
    queryKey: ['journal-prompt', id],
    queryFn: () => fetchJournalPromptById(id || ''),
    enabled: !!id,
  });

  // Auto-save functionality
  useEffect(() => {
    // Only start auto-save if there's content
    if (content.trim().length > 10) {
      if (autoSaveInterval === null) {
        const interval = setInterval(() => {
          handleSave(true);
        }, 30000); // Auto-save every 30 seconds
        
        setAutoSaveInterval(interval);
      }
    }
    
    return () => {
      if (autoSaveInterval !== null) {
        clearInterval(autoSaveInterval);
      }
    };
  }, [content, autoSaveInterval]);

  const handleSave = (isAutoSave: boolean = false) => {
    if (!content.trim()) return;
    
    saveJournal.mutate(
      { promptId: id || null, content },
      { 
        onSuccess: () => {
          setLastSaved(new Date());
          
          if (!isAutoSave) {
            // If it's a manual save, navigate back
            navigate('/wellness');
          }
        }
      }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-60 bg-white/10 rounded"></div>
            <div className="h-40 w-full bg-white/10 rounded"></div>
            <div className="h-12 w-40 bg-white/10 rounded mx-auto"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/wellness')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Wellness Hub
          </Button>
          
          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="text-sm text-white/60">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            
            <Button 
              onClick={() => handleSave()}
              disabled={saveJournal.isPending || !content.trim()}
              className="bg-music-primary hover:bg-music-primary/80"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Entry
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="write" className="w-full mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="write" className="data-[state=active]:bg-music-primary/20">Write</TabsTrigger>
            <TabsTrigger value="prompt" className="data-[state=active]:bg-music-primary/20">Prompt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="write" className="pt-4">
            <div className="mb-4">
              <h1 className="text-2xl font-bold flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                {prompt?.title || "Free Writing"}
              </h1>
              <div className="flex items-center text-white/70 text-sm mt-1">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {prompt ? `${prompt.duration_minutes} min` : "Journaling"}
                </span>
              </div>
            </div>
            
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your thoughts here..."
              className="min-h-[500px] bg-card/30 backdrop-blur-sm border-white/10 focus:border-white/30"
            />
          </TabsContent>
          
          <TabsContent value="prompt" className="pt-4">
            {prompt && (
              <div className="bg-card/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">{prompt.title}</h2>
                <p className="text-white/70 mb-4">{prompt.description}</p>
                <div className="pl-4 border-l-2 border-music-primary text-white/90">
                  <p className="whitespace-pre-wrap">{prompt.prompt_text}</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default JournalingPage;
