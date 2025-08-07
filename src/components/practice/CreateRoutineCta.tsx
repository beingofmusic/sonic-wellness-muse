
import React from "react";
import { Music } from "lucide-react";
import { CreateRoutineButton } from "./CreateRoutineModal";

const CreateRoutineCta: React.FC = () => {
  

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
          <CreateRoutineButton size="lg" className="px-6" />
        </div>
      </div>
    </section>
  );
};

export default CreateRoutineCta;
