
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronUp, CirclePlay, CircleStop } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Metronome, MetronomeOptions } from "@/lib/metronome";
import { DroneGenerator, DroneOptions, ChordType } from "@/lib/droneGenerator";

const PracticeTools: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [tempo, setTempo] = useState([100]);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [timeSignature, setTimeSignature] = useState<"2/4" | "3/4" | "4/4">("4/4");
  const [rootNote, setRootNote] = useState<string | null>(null);
  const [isDroneActive, setIsDroneActive] = useState(false);
  const [playChord, setPlayChord] = useState(false);
  const [chordType, setChordType] = useState<ChordType>("major");
  
  // Refs to store class instances
  const metronomeRef = useRef<Metronome | null>(null);
  const droneRef = useRef<DroneGenerator | null>(null);
  
  // Initialize audio tools on component mount
  useEffect(() => {
    metronomeRef.current = new Metronome({ tempo: tempo[0], timeSignature });
    droneRef.current = new DroneGenerator({ 
      rootNote: rootNote || "A", 
      playChord, 
      chordType 
    });
    
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
    if (droneRef.current && rootNote) {
      droneRef.current.updateOptions({ rootNote, playChord, chordType });
      
      // Update active state based on drone's status
      setIsDroneActive(droneRef.current.isActive());
    }
  }, [rootNote, playChord, chordType]);
  
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
        setIsDroneActive(false);
      } else if (rootNote) {
        await droneRef.current.start();
        setIsDroneActive(true);
      }
    }
  };
  
  const selectRootNote = async (note: string) => {
    setRootNote(note);
    if (droneRef.current) {
      // If we're not playing yet, start automatically
      if (!isDroneActive) {
        await droneRef.current.start();
        setIsDroneActive(true);
      } else {
        // If already playing, the updateOptions in the useEffect will handle the change
      }
    }
  };
  
  const notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
  const chordTypes: { value: ChordType, label: string }[] = [
    { value: "major", label: "Major" },
    { value: "minor", label: "Minor" },
    { value: "diminished", label: "Diminished" },
    { value: "augmented", label: "Augmented" }
  ];
  
  // Get current playing status for display
  const getDroneStatusText = () => {
    if (!isDroneActive || !rootNote) return null;
    
    if (playChord) {
      return `Now Playing: ${rootNote} ${chordType}`;
    }
    return `Now Playing: ${rootNote}`;
  };
  
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
          
          {/* Drone Generator */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎧</span>
              <h4 className="font-medium">Drone Generator</h4>
            </div>
            
            <div>
              {/* Current drone status display */}
              {getDroneStatusText() && (
                <div className="mb-4 p-2 bg-music-primary/20 border border-music-primary/30 rounded text-center">
                  {getDroneStatusText()}
                </div>
              )}
              
              <span className="text-sm text-white/70 block mb-2">Root Note</span>
              <div className="grid grid-cols-4 gap-2">
                {notes.map(note => (
                  <Button
                    key={note}
                    variant={rootNote === note ? "default" : "outline"}
                    size="sm"
                    onClick={() => selectRootNote(note)}
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
              
              {/* Chord Type Selector - only visible when Play as chord is enabled */}
              {playChord && (
                <div className="mt-3">
                  <span className="text-sm text-white/70 block mb-2">Chord Type</span>
                  <Select
                    defaultValue={chordType}
                    onValueChange={(value) => setChordType(value as ChordType)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chord Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {chordTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button 
                className={`w-full mt-4 ${isDroneActive ? "bg-music-secondary" : ""}`}
                onClick={toggleDrone}
                disabled={!rootNote}
              >
                {isDroneActive ? (
                  <>
                    <CircleStop className="h-4 w-4 mr-2" />
                    Stop Drone
                  </>
                ) : (
                  <>
                    <CirclePlay className="h-4 w-4 mr-2" />
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
