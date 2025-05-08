
import React, { useState, useEffect, useRef } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Metronome, MetronomeOptions } from "@/lib/metronome";
import { DroneGenerator, DroneOptions, ChordType } from "@/lib/droneGenerator";
import MetronomeSection from "./MetronomeSection";
import DroneSection from "./DroneSection";

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
          <MetronomeSection 
            tempo={tempo}
            setTempo={setTempo}
            timeSignature={timeSignature}
            setTimeSignature={setTimeSignature}
            isMetronomeActive={isMetronomeActive}
            toggleMetronome={toggleMetronome}
          />
          
          {/* Drone Generator */}
          <DroneSection 
            rootNote={rootNote}
            selectRootNote={selectRootNote}
            playChord={playChord}
            setPlayChord={setPlayChord}
            chordType={chordType}
            setChordType={setChordType}
            isDroneActive={isDroneActive}
            toggleDrone={toggleDrone}
            getDroneStatusText={getDroneStatusText}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default PracticeTools;
