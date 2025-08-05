import React from "react";
import { Button } from "@/components/ui/button";
import { Timer, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OpenPracticeMode: React.FC = () => {
  const navigate = useNavigate();

  const handleStartOpenPractice = () => {
    navigate("/practice/open");
  };

  return (
    <section className="p-6 rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="md:max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="h-5 w-5 text-music-primary" />
            <h2 className="text-2xl font-semibold">Open Practice Mode</h2>
          </div>
          <p className="text-white/70">
            Start a freeform practice session without a structured routine. Perfect for improvisation, exploration, or when you just want to play.
          </p>
        </div>
        
        <Button 
          onClick={handleStartOpenPractice}
          className="bg-gradient-to-r from-music-primary to-music-secondary hover:opacity-90 text-white px-8"
          size="lg"
        >
          <Play className="mr-2 h-4 w-4" />
          Start Open Practice
        </Button>
      </div>
    </section>
  );
};

export default OpenPracticeMode;