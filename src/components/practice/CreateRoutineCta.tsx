
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateRoutineCta: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateRoutine = () => {
    navigate("/practice/builder");
  };

  return (
    <section className="p-6 rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="md:max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Music className="h-5 w-5 text-music-primary" />
            <h2 className="text-2xl font-semibold">Create Your Custom Practice Routine</h2>
          </div>
          <p className="text-white/70">
            Design your own personalized practice session with warm-ups, technical exercises, 
            creative activities, and mindfulness practices tailored to your needs.
          </p>
        </div>
        
        <Button 
          onClick={handleCreateRoutine}
          className="bg-music-primary hover:bg-music-secondary text-white px-6"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Routine
        </Button>
      </div>
    </section>
  );
};

export default CreateRoutineCta;
