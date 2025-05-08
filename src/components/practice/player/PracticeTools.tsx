
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Metronome, MetronomeOptions } from "@/lib/metronome";
import { DroneGenerator, DroneOptions } from "@/lib/droneGenerator";

const PracticeTools: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [tempo, setTempo] = useState([100]);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [timeSignature, setTimeSignature] = useState<"2/4" | "3/4" | "4/4">("4/4");
  const [rootNote, setRootNote] = useState("A");
  const [isDroneActive, setIsDroneActive] = useState(false);
  const [playChord, setPlayChord] = useState(false);
  
  // Refs to store class instances
  const metronomeRef = useRef<Metronome | null>(null);
  const droneRef = useRef<DroneGenerator | null>(null);
  
  // Initialize audio tools on component mount
  useEffect(() => {
    metronomeRef.current = new Metronome({ tempo: tempo[0], timeSignature });
    droneRef.current = new DroneGenerator({ rootNote, playChord });
    
    // Cleanup on unmount
    return () => {
      if (metronomeRef.current?.isActive()) {
        metronomeRef.current.stop();
      }
      if (droneRef.current?.isActive()) {
        droneRef.current.stop();
      }
    };
  }, []);
  
  // Update metronome when tempo changes
  useEffect(() => {
    if (metronomeRef.current) {
      metronomeRef.current.updateTempo(tempo[0]);
    }
  }, [tempo]);
  
  // Update metronome when time signature changes
  useEffect(() => {
    if (metronomeRef.current) {
      metronomeRef.current.updateTimeSignature(timeSignature);
    }
  }, [timeSignature]);
  
  // Update drone generator when options change
  useEffect(() => {
    if (droneRef.current) {
      droneRef.current.updateOptions({ rootNote, playChord });
    }
  }, [rootNote, playChord]);
  
  const toggleMetronome = () => {
    if (metronomeRef.current) {
      if (isMetronomeActive) {
        metronomeRef.current.stop();
      } else {
        metronomeRef.current.start();
      }
      setIsMetronomeActive(!isMetronomeActive);
    }
  };
  
  const toggleDrone = async () => {
    if (droneRef.current) {
      if (isDroneActive) {
        droneRef.current.stop();
      } else {
        await droneRef.current.start();
      }
      setIsDroneActive(!isDroneActive);
    }
  };
  
  const notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="rounded-xl border border-white/10 bg-card/80 backdrop-blur-sm overflow-hidden">
      <CollapsibleTrigger asChild>
        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5">
          <h3 className="font-semibold text-lg">Practice Tools</h3>
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="p-4 pt-0 space-y-6">
          {/* Metronome */}
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
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Metronome
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Metronome
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Drone Generator */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎧</span>
              <h4 className="font-medium">Drone Generator</h4>
            </div>
            
            <div>
              <span className="text-sm text-white/70 block mb-2">Root Note</span>
              <div className="grid grid-cols-4 gap-2">
                {notes.map(note => (
                  <Button
                    key={note}
                    variant={rootNote === note ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRootNote(note)}
                    className={rootNote === note ? "bg-music-primary" : ""}
                  >
                    {note}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-white/70">Play as chord</span>
                <Switch 
                  checked={playChord}
                  onCheckedChange={setPlayChord}
                />
              </div>
              
              <Button 
                className={`w-full mt-4 ${isDroneActive ? "bg-music-secondary" : ""}`}
                onClick={toggleDrone}
              >
                {isDroneActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Drone
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Drone
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default PracticeTools;
