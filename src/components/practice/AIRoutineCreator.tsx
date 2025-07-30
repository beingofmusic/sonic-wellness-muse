import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Loader2, Sparkles, Globe, Lock } from "lucide-react";
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
}

const AIRoutineCreator: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<AIRoutineFormData>({
    timeAvailable: 30,
    focusArea: '',
    goals: '',
    instrument: '',
    visibility: 'public',
  });

  const handleGenerate = async () => {
    if (!user || !formData.focusArea || !formData.goals.trim() || !formData.instrument) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-routine-generator', {
        body: {
          ...formData,
          userId: user.id,
        },
      });

      if (error) throw error;

      const generatedRoutine: GeneratedRoutine = data;
      
      // Create the routine in the database
      const { data: routine, error: routineError } = await supabase
        .from('routines')
        .insert({
          title: generatedRoutine.title,
          description: generatedRoutine.description,
          duration: generatedRoutine.estimatedDuration,
          created_by: user.id,
          is_template: false,
          ai_generated: true,
          generation_context: {
            focusArea: formData.focusArea,
            goals: formData.goals,
            instrument: formData.instrument,
            timeAvailable: formData.timeAvailable,
            generatedAt: new Date().toISOString()
          },
          tags: [formData.focusArea, formData.instrument, 'ai-generated'],
          visibility: formData.visibility,
        })
        .select()
        .single();

      if (routineError) throw routineError;

      // Create the blocks
      const blocksToInsert = generatedRoutine.blocks.map((block, index) => ({
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

      toast.success("AI routine generated successfully!");
      navigate(`/practice/builder/${routine.id}`);

    } catch (error) {
      console.error('Error generating routine:', error);
      toast.error("Failed to generate routine. Please try again.");
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

        <p className="text-sm text-white/60 text-center">
          Your routine will be tailored based on your responses, practice history, and current goals.
        </p>
      </CardContent>
    </Card>
  );
};

export default AIRoutineCreator;