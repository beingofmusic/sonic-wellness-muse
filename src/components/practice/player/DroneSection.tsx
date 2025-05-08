
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CirclePlay, CircleStop } from "lucide-react";
import { ChordType } from "@/lib/droneGenerator";

interface DroneSectionProps {
  rootNote: string | null;
  selectRootNote: (note: string) => void;
  playChord: boolean;
  setPlayChord: (play: boolean) => void;
  chordType: ChordType;
  setChordType: (type: ChordType) => void;
  isDroneActive: boolean;
  toggleDrone: () => void;
  getDroneStatusText: () => string | null;
}

const DroneSection: React.FC<DroneSectionProps> = ({
  rootNote,
  selectRootNote,
  playChord,
  setPlayChord,
  chordType,
  setChordType,
  isDroneActive,
  toggleDrone,
  getDroneStatusText,
}) => {
  const notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
  const chordTypes: { value: ChordType, label: string }[] = [
    { value: "major", label: "Major" },
    { value: "minor", label: "Minor" },
    { value: "diminished", label: "Diminished" },
    { value: "augmented", label: "Augmented" }
  ];
  
  return (
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
              value={chordType}
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
  );
};

export default DroneSection;
