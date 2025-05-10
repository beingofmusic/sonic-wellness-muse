
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  FileQuestion, 
  FileText, 
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { useJournalPrompt, useJournalEntry, useSaveJournalEntry, useJournalAutoSave } from '@/hooks/useJournal';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const JournalPrompt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch prompt and existing entry
  const { data: prompt, isLoading: isLoadingPrompt } = useJournalPrompt(id);
  const { data: entry, isLoading: isLoadingEntry } = useJournalEntry(id);
  const saveEntry = useSaveJournalEntry();
  
  // Set up auto-save
  const { lastSaved } = useJournalAutoSave(id, content);

  // Init content from existing entry
  useEffect(() => {
    if (entry?.content) {
      setContent(entry.content);
    }
  }, [entry]);

  const handleSave = (markAsCompleted: boolean = false) => {
    if (!id || !content.trim()) return;
    
    saveEntry.mutate(
      { promptId: id, content, isCompleted: markAsCompleted },
      { 
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['journal-entry', id] });
          queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
          queryClient.invalidateQueries({ queryKey: ['journal-progress'] });
          
          if (markAsCompleted) {
            navigate(-1);
          }
        }
      }
    );
  };

  const handleComplete = () => {
    setIsDialogOpen(true);
  };

  const confirmComplete = () => {
    handleSave(true);
    setIsDialogOpen(false);
  };

  const getSectionFromPrompt = () => {
    if (!prompt) return null;
    
    switch (prompt.section) {
      case "past": return "Past Authoring";
      case "present": return "Present Authoring";
      case "future": return "Future Authoring";
      default: return "";
    }
  };
  
  const isLoading = isLoadingPrompt || isLoadingEntry;
  
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
  
  if (!prompt) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Prompt Not Found</h2>
          <p className="mb-6">The journal prompt you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/journal')}>Return to Journal</Button>
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
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="text-sm text-white/60">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            
            <Button 
              onClick={() => handleSave()}
              disabled={saveEntry.isPending || !content.trim()}
              variant="outline"
              className="bg-white/5 hover:bg-white/10"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            
            <Button 
              onClick={handleComplete}
              disabled={saveEntry.isPending || !content.trim()}
              className="bg-music-primary hover:bg-music-primary/80"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete
            </Button>
          </div>
        </div>
        
        <div className="text-xs uppercase tracking-wide text-white/50 font-semibold mb-2">
          {getSectionFromPrompt()}
        </div>
        
        <Tabs defaultValue="write" className="w-full mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="write" className="data-[state=active]:bg-music-primary/20">Write</TabsTrigger>
            <TabsTrigger value="prompt" className="data-[state=active]:bg-music-primary/20">Prompt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="write" className="pt-4">
            <div className="mb-4">
              <h1 className="text-2xl font-bold flex items-center">
                <FileText className="mr-2 h-5 w-5 text-music-primary" />
                {prompt.title}
              </h1>
              <p className="text-white/70 mt-1">
                {prompt.description}
              </p>
            </div>
            
            <RichTextEditor 
              value={content}
              onChange={setContent}
              placeholder="Start writing your thoughts here..."
              className="min-h-[500px]"
            />
          </TabsContent>
          
          <TabsContent value="prompt" className="pt-4">
            <div className="bg-card/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <FileQuestion className="mr-2 h-5 w-5 text-music-primary" />
                {prompt.title}
              </h2>
              <p className="text-white/70 mb-4">{prompt.description}</p>
              <div className="pl-4 border-l-2 border-music-primary text-white/90">
                <p className="whitespace-pre-wrap">{prompt.prompt_text}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Completion confirmation dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete this journal entry?</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this entry as complete? This will save your work and help track your progress through the Musical Self-Composition Suite.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Continue Writing
            </Button>
            <Button 
              onClick={confirmComplete} 
              className="bg-music-primary hover:bg-music-primary/80"
            >
              <FileCheck className="mr-2 h-4 w-4" />
              Mark as Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default JournalPrompt;
