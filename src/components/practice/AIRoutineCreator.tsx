import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Sparkles, Globe, Lock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AIRoutineFormData {
  timeAvailable: number;
  focusArea: string;
  goals: string;
  instrument: string;
  visibility: "public" | "private";
  // New optional personalization fields
  skillLevel?: string;
  genres?: string[];
  mood?: string;
  challenges?: string;
  preferences?: {
    metronome?: boolean;
    drone?: boolean;
    recording?: boolean;
  };
  equipment?: string[];
}

interface GeneratedRoutine {
  title: string;
  description: string;
  estimatedDuration: number;
  blocks: Array<{
    type: string;
    content: string;
    duration: number;
    instructions: string;
  }>;
  rationale: string;
  tips?: string[];
}

const AIRoutineCreator: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedRoutine | null>(null);
  const [formData, setFormData] = useState<AIRoutineFormData>({
    timeAvailable: 30,
    focusArea: '',
    goals: '',
    instrument: '',
    visibility: 'public',
    skillLevel: 'intermediate',
    genres: [],
    mood: undefined,
    challenges: '',
    preferences: { metronome: true, drone: false, recording: false },
    equipment: [],
  });

  const availableGenres = ["classical","jazz","pop","rock","blues","folk","latin","hip-hop"];

  const handleGenerate = async () => {
    if (!user || !formData.focusArea || !formData.goals.trim() || !formData.instrument) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-routine-generator', {
        body: {
          timeAvailable: formData.timeAvailable,
          focusArea: formData.focusArea,
          goals: formData.goals,
          instrument: formData.instrument,
          userId: user.id,
          skillLevel: formData.skillLevel,
          genres: formData.genres,
          mood: formData.mood,
          challenges: formData.challenges,
          preferences: formData.preferences,
          equipment: formData.equipment,
        },
      });

      if (error) throw error;

      setGenerated(data as GeneratedRoutine);
      toast.success("Preview generated! Review below.");

    } catch (error) {
      console.error('Error generating routine:', error);
      toast.error("Failed to generate routine. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user || !generated) return;
    setIsGenerating(true);

    try {
      const { data: routine, error: routineError } = await supabase
        .from('routines')
        .insert({
          title: generated.title,
          description: generated.description,
          duration: generated.estimatedDuration,
          created_by: user.id,
          is_template: false,
          ai_generated: true,
          generation_context: {
            focusArea: formData.focusArea,
            goals: formData.goals,
            instrument: formData.instrument,
            timeAvailable: formData.timeAvailable,
            skillLevel: formData.skillLevel,
            genres: formData.genres,
            mood: formData.mood,
            challenges: formData.challenges,
            preferences: formData.preferences,
            equipment: formData.equipment,
            generatedAt: new Date().toISOString()
          },
          tags: [formData.focusArea, formData.instrument, ...(formData.genres || []), 'ai-generated'],
          visibility: formData.visibility,
        })
        .select()
        .single();

      if (routineError) throw routineError;

      const blocksToInsert = generated.blocks.map((block, index) => ({
        routine_id: routine.id,
        type: block.type,
        content: block.content,
        duration: block.duration,
        instructions: block.instructions,
        order_index: index,
      }));

      const { error: blocksError } = await supabase
        .from('routine_blocks')
        .insert(blocksToInsert);

      if (blocksError) throw blocksError;

      toast.success("Routine saved! Opening in builder…");
      navigate(`/practice/builder/${routine.id}`);

    } catch (error) {
      console.error('Error saving routine:', error);
      toast.error("Failed to save routine. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border-white/10">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-music-primary to-music-secondary rounded-full flex items-center justify-center mb-3">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl">AI Practice Routine Generator</CardTitle>
        <CardDescription>
          Answer a few questions and let AI create a personalized practice routine just for you
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="timeAvailable">How much time do you have? ({formData.timeAvailable} minutes)</Label>
          <Slider
            id="timeAvailable"
            min={10}
            max={120}
            step={5}
            value={[formData.timeAvailable]}
            onValueChange={(value) => setFormData(prev => ({ ...prev, timeAvailable: value[0] }))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-white/60">
            <span>10 min</span>
            <span>120 min</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="focusArea">What do you want to focus on today?</Label>
          <Select value={formData.focusArea} onValueChange={(value) => setFormData(prev => ({ ...prev, focusArea: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select your focus area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tone">Tone & Sound Quality</SelectItem>
              <SelectItem value="technique">Technical Skills</SelectItem>
              <SelectItem value="improvisation">Improvisation</SelectItem>
              <SelectItem value="repertoire">Learning New Pieces</SelectItem>
              <SelectItem value="creativity">Creative Exploration</SelectItem>
              <SelectItem value="maintenance">Skill Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="goals">Describe your goals or what you'd like to work on today:</Label>
          <Textarea
            id="goals"
            placeholder="E.g. I want to improve tone, clean up my jazz solos, and work on high range."
            value={formData.goals}
            onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instrument">What's your primary instrument?</Label>
          <Select value={formData.instrument} onValueChange={(value) => setFormData(prev => ({ ...prev, instrument: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select your instrument" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trumpet">Trumpet</SelectItem>
              <SelectItem value="saxophone">Saxophone</SelectItem>
              <SelectItem value="trombone">Trombone</SelectItem>
              <SelectItem value="clarinet">Clarinet</SelectItem>
              <SelectItem value="flute">Flute</SelectItem>
              <SelectItem value="piano">Piano</SelectItem>
              <SelectItem value="guitar">Guitar</SelectItem>
              <SelectItem value="bass">Bass</SelectItem>
              <SelectItem value="drums">Drums</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skillLevel">What is your current skill level?</Label>
          <Select value={formData.skillLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, skillLevel: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select your level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Preferred genres</Label>
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((g) => {
              const checked = formData.genres?.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setFormData(prev => {
                      const set = new Set(prev.genres || []);
                      if (set.has(g)) set.delete(g); else set.add(g);
                      return { ...prev, genres: Array.from(set) };
                    });
                  }}
                  className={`px-3 py-1 rounded-full border ${checked ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent'}`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="challenges">Any current challenges to consider? (optional)</Label>
          <Textarea
            id="challenges"
            placeholder="E.g. lip fatigue, recovering from injury, timing issues, breath control..."
            value={formData.challenges}
            onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
            className="min-h-[80px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label>Practice preferences</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={!!formData.preferences?.metronome}
                onCheckedChange={(val) => setFormData(prev => ({ ...prev, preferences: { ...(prev.preferences || {}), metronome: Boolean(val) } }))}
              />
              <span className="text-sm">Use metronome</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={!!formData.preferences?.drone}
                onCheckedChange={(val) => setFormData(prev => ({ ...prev, preferences: { ...(prev.preferences || {}), drone: Boolean(val) } }))}
              />
              <span className="text-sm">Use drone</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={!!formData.preferences?.recording}
                onCheckedChange={(val) => setFormData(prev => ({ ...prev, preferences: { ...(prev.preferences || {}), recording: Boolean(val) } }))}
              />
              <span className="text-sm">Record session</span>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Visibility</Label>
          <RadioGroup
            value={formData.visibility}
            onValueChange={(value: "public" | "private") => setFormData(prev => ({ ...prev, visibility: value }))}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="ai-public" />
              <label 
                htmlFor="ai-public" 
                className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Globe className="h-4 w-4" />
                Public – Shared with the community
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="ai-private" />
              <label 
                htmlFor="ai-private" 
                className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Lock className="h-4 w-4" />
                Private – Only visible to you
              </label>
            </div>
          </RadioGroup>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !formData.focusArea || !formData.goals.trim() || !formData.instrument}
          className="w-full bg-gradient-to-r from-music-primary to-music-secondary hover:opacity-90"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Your Routine...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate My Practice Routine
            </>
          )}
        </Button>

        {generated && (
          <div className="mt-6 space-y-4 border rounded-lg p-4 border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{generated.title}</h3>
                <p className="text-sm text-white/70">{generated.description}</p>
              </div>
              <Badge variant="secondary">{generated.estimatedDuration} min</Badge>
            </div>

            <div className="space-y-3">
              {generated.blocks.map((b, i) => (
                <div key={i} className="rounded-md border border-white/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{i + 1}. {b.type}</div>
                    <span className="text-xs text-white/70">{b.duration} min</span>
                  </div>
                  <div className="text-sm mt-1">{b.content}</div>
                  <div className="text-xs text-white/70 mt-1">{b.instructions}</div>
                </div>
              ))}
            </div>

            {generated.tips && generated.tips.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Personalized tips</h4>
                <ul className="list-disc pl-5 text-sm text-white/80">
                  {generated.tips.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1" size="lg">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Use This Routine
              </Button>
              <Button variant="outline" onClick={() => setGenerated(null)} className="flex-1" size="lg">
                Try Again
              </Button>
            </div>
          </div>
        )}

        <p className="text-sm text-white/60 text-center">
          Your routine will be tailored based on your responses, practice history, and current goals.
        </p>
      </CardContent>
    </Card>
  );
};

export default AIRoutineCreator;