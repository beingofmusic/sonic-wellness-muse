
import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CirclePlay, CircleStop } from "lucide-react";

interface MetronomeSectionProps {
  tempo: number[];
  setTempo: (tempo: number[]) => void;
  timeSignature: "2/4" | "3/4" | "4/4";
  setTimeSignature: (sig: "2/4" | "3/4" | "4/4") => void;
  isMetronomeActive: boolean;
  toggleMetronome: () => void;
}

const MetronomeSection: React.FC<MetronomeSectionProps> = ({
  tempo,
  setTempo,
  timeSignature,
  setTimeSignature,
  isMetronomeActive,
  toggleMetronome,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎵</span>
        <h4 className="font-medium">Metronome</h4>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Tempo</span>
          <span className="text-sm font-mono">{tempo[0]} BPM</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setTempo([Math.max(40, tempo[0] - 5)])}
          >
            -
          </Button>
          <Slider 
            value={tempo} 
            onValueChange={setTempo} 
            min={40} 
            max={240} 
            step={1} 
            className="flex-1"
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setTempo([Math.min(240, tempo[0] + 5)])}
          >
            +
          </Button>
        </div>
        
        <div>
          <span className="text-sm text-white/70 block mb-2">Time Signature</span>
          <div className="flex gap-2">
            {["2/4", "3/4", "4/4"].map(sig => (
              <Button
                key={sig}
                variant={timeSignature === sig ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeSignature(sig as "2/4" | "3/4" | "4/4")}
                className={timeSignature === sig ? "bg-music-primary" : ""}
              >
                {sig}
              </Button>
            ))}
          </div>
        </div>
        
        <Button 
          className={`w-full mt-2 ${isMetronomeActive ? "bg-music-secondary" : ""}`}
          onClick={toggleMetronome}
        >
          {isMetronomeActive ? (
            <>
              <CircleStop className="h-4 w-4 mr-2" />
              Stop Metronome
            </>
          ) : (
            <>
              <CirclePlay className="h-4 w-4 mr-2" />
              Start Metronome
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MetronomeSection;
