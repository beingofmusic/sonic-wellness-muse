import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";

interface ProfileEditorFieldsProps {
  // Current values
  primaryInstruments: string[];
  secondaryInstruments: string[];
  musicalInterests: string[];
  skillLevel: string;
  location: string;
  lookingFor: string[];
  aboutMe: string;
  
  // Setters
  setPrimaryInstruments: (instruments: string[]) => void;
  setSecondaryInstruments: (instruments: string[]) => void;
  setMusicalInterests: (interests: string[]) => void;
  setSkillLevel: (level: string) => void;
  setLocation: (location: string) => void;
  setLookingFor: (items: string[]) => void;
  setAboutMe: (text: string) => void;
  
  disabled?: boolean;
}

const ProfileEditorFields: React.FC<ProfileEditorFieldsProps> = ({
  primaryInstruments,
  secondaryInstruments,
  musicalInterests,
  skillLevel,
  location,
  lookingFor,
  aboutMe,
  setPrimaryInstruments,
  setSecondaryInstruments,
  setMusicalInterests,
  setSkillLevel,
  setLocation,
  setLookingFor,
  setAboutMe,
  disabled = false,
}) => {
  // Predefined options
  const instrumentOptions = [
    "Piano", "Guitar", "Violin", "Saxophone", "Trumpet", "Drums", "Bass", "Flute", 
    "Clarinet", "Cello", "Trombone", "Voice", "Ukulele", "Harp", "Oboe", "French Horn"
  ];
  
  const interestOptions = [
    "Jazz", "Classical", "Rock", "Pop", "Blues", "Folk", "Electronic", "Hip-Hop",
    "Composition", "Improvisation", "Music Theory", "Recording", "Production", 
    "Performance", "Teaching", "Arranging"
  ];
  
  const lookingForOptions = [
    "Collaboration", "Feedback", "Motivation", "Lessons", "Jam Sessions", 
    "Performance Opportunities", "Recording Projects", "Study Partners"
  ];

  // Input states for adding new items
  const [newPrimaryInstrument, setNewPrimaryInstrument] = useState("");
  const [newSecondaryInstrument, setNewSecondaryInstrument] = useState("");
  const [newMusicalInterest, setNewMusicalInterest] = useState("");
  const [newLookingFor, setNewLookingFor] = useState("");

  // Helper functions
  const addItem = (value: string, currentList: string[], setter: (list: string[]) => void, clearInput: () => void) => {
    if (value.trim() && !currentList.includes(value.trim())) {
      setter([...currentList, value.trim()]);
      clearInput();
    }
  };

  const removeItem = (index: number, currentList: string[], setter: (list: string[]) => void) => {
    setter(currentList.filter((_, i) => i !== index));
  };

  const renderTagSection = (
    title: string,
    items: string[],
    newItemValue: string,
    setNewItemValue: (value: string) => void,
    onAdd: () => void,
    onRemove: (index: number) => void,
    suggestions: string[],
    placeholder: string
  ) => (
    <div className="grid gap-2">
      <Label>{title}</Label>
      
      {/* Current tags */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {items.map((item, index) => (
            <Badge key={index} variant="secondary" className="bg-music-primary/20 text-music-primary">
              {item}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 hover:bg-transparent"
                onClick={() => onRemove(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Add new item */}
      <div className="flex gap-2">
        <Input
          value={newItemValue}
          onChange={(e) => setNewItemValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={disabled || !newItemValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="text-xs text-white/50 mr-2">Quick add:</span>
          {suggestions
            .filter(suggestion => !items.includes(suggestion))
            .slice(0, 6)
            .map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-white/70 hover:text-white"
                onClick={() => {
                  if (!items.includes(suggestion)) {
                    setNewItemValue(suggestion);
                    onAdd();
                  }
                }}
                disabled={disabled}
              >
                + {suggestion}
              </Button>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 border-t border-white/10 pt-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-music-primary">Musical Identity</h3>
        <p className="text-sm text-white/70 mb-6">
          Share your musical background to connect with like-minded musicians
        </p>
      </div>

      {/* Primary Instruments */}
      {renderTagSection(
        "Primary Instruments",
        primaryInstruments,
        newPrimaryInstrument,
        setNewPrimaryInstrument,
        () => addItem(newPrimaryInstrument, primaryInstruments, setPrimaryInstruments, () => setNewPrimaryInstrument("")),
        (index) => removeItem(index, primaryInstruments, setPrimaryInstruments),
        instrumentOptions,
        "Add your main instrument(s)"
      )}

      {/* Secondary Instruments */}
      {renderTagSection(
        "Secondary Instruments (Optional)",
        secondaryInstruments,
        newSecondaryInstrument,
        setNewSecondaryInstrument,
        () => addItem(newSecondaryInstrument, secondaryInstruments, setSecondaryInstruments, () => setNewSecondaryInstrument("")),
        (index) => removeItem(index, secondaryInstruments, setSecondaryInstruments),
        instrumentOptions.filter(inst => !primaryInstruments.includes(inst)),
        "Add secondary instruments"
      )}

      {/* Musical Interests */}
      {renderTagSection(
        "Musical Interests",
        musicalInterests,
        newMusicalInterest,
        setNewMusicalInterest,
        () => addItem(newMusicalInterest, musicalInterests, setMusicalInterests, () => setNewMusicalInterest("")),
        (index) => removeItem(index, musicalInterests, setMusicalInterests),
        interestOptions,
        "Add your musical interests"
      )}

      {/* Skill Level */}
      <div className="grid gap-2">
        <Label htmlFor="skillLevel">Skill Level</Label>
        <Select value={skillLevel} onValueChange={setSkillLevel} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Select your skill level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="pro">Professional</SelectItem>
            <SelectItem value="educator">Educator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="grid gap-2">
        <Label htmlFor="location">Location (Optional)</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, State or Region"
          disabled={disabled}
        />
      </div>

      {/* Looking For */}
      {renderTagSection(
        "Looking For (Optional)",
        lookingFor,
        newLookingFor,
        setNewLookingFor,
        () => addItem(newLookingFor, lookingFor, setLookingFor, () => setNewLookingFor("")),
        (index) => removeItem(index, lookingFor, setLookingFor),
        lookingForOptions,
        "What are you looking for in the community?"
      )}

      {/* About Me */}
      <div className="grid gap-2">
        <Label htmlFor="aboutMe">About Me (Optional)</Label>
        <Textarea
          id="aboutMe"
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
          placeholder="Share a bit about your musical journey (1-3 sentences)"
          rows={3}
          disabled={disabled}
          className="resize-none"
        />
        <p className="text-xs text-white/50">
          {aboutMe.length}/300 characters
        </p>
      </div>
    </div>
  );
};

export default ProfileEditorFields;