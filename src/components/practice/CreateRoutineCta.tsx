
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Music, Brain, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AIRoutineCreator from "./AIRoutineCreator";

const CreateRoutineCta: React.FC = () => {
  const navigate = useNavigate();
  const [showAIDialog, setShowAIDialog] = useState(false);

  const handleCreateRoutine = () => {
    navigate("/practice/builder");
  };

  return (
    <section className="p-6 rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="md:max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Music className="h-5 w-5 text-music-primary" />
            <h2 className="text-2xl font-semibold">Create Your Practice Routine</h2>
          </div>
          <p className="text-white/70">
            Let AI generate a personalized routine based on your goals and time, or build your own custom session.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-music-primary to-music-secondary hover:opacity-90 text-white px-6"
                size="lg"
              >
                <Brain className="mr-2 h-4 w-4" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-md border-white/10">
              <AIRoutineCreator />
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleCreateRoutine}
            variant="outline"
            className="border-white/20 bg-white/5 hover:bg-white/10 text-white px-6"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Build Custom
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CreateRoutineCta;
