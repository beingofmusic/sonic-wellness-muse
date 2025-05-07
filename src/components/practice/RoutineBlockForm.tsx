
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ArrowUp, ArrowDown, Trash2, Guitar, Drum, Headphones, Mic, MicOff, Plus } from "lucide-react";
import { RoutineFormValues } from "@/schemas/routineSchema";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const BLOCK_TYPES = [
  { value: "warmup", label: "Warm-up", icon: <Mic className="h-4 w-4 text-orange-400" /> },
  { value: "technique", label: "Technique", icon: <Guitar className="h-4 w-4 text-music-primary" /> },
  { value: "mindfulness", label: "Mindfulness", icon: <Headphones className="h-4 w-4 text-blue-400" /> },
  { value: "creative", label: "Creative", icon: <Drum className="h-4 w-4 text-green-400" /> },
  { value: "cooldown", label: "Cool-down", icon: <MicOff className="h-4 w-4 text-purple-400" /> },
];

const getPlaceholderByType = (type: string): string => {
  switch (type) {
    case "warmup":
      return "e.g., Lip slurs on middle C, gentle vocalization exercises";
    case "technique":
      return "e.g., Scale patterns in G major, finger dexterity exercises";
    case "mindfulness":
      return "e.g., Focus on breath for 2 minutes, listen to reference track";
    case "creative":
      return "e.g., Improvise over backing track, compose a short melody";
    case "cooldown":
      return "e.g., Long tones, gentle stretching, reflection exercise";
    default:
      return "Enter instructions or cues for this block";
  }
};

const getIconForType = (type: string) => {
  const blockType = BLOCK_TYPES.find(t => t.value === type);
  return blockType?.icon || <Guitar className="h-4 w-4" />;
};

const getBgColorForType = (type: string): string => {
  switch (type) {
    case "warmup":
      return "from-orange-500/5 to-orange-500/10";
    case "technique":
      return "from-music-primary/5 to-music-primary/10";
    case "mindfulness":
      return "from-blue-500/5 to-blue-500/10";
    case "creative":
      return "from-green-500/5 to-green-500/10";
    case "cooldown":
      return "from-purple-500/5 to-purple-500/10";
    default:
      return "from-gray-500/5 to-gray-500/10";
  }
};

const RoutineBlockForm: React.FC = () => {
  const { control, formState: { errors }, watch } = useFormContext<RoutineFormValues>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "blocks",
  });

  const blocks = watch("blocks");
  
  const handleAddBlock = () => {
    append({ 
      type: "warmup", 
      duration: 5, 
      content: "", 
      order_index: fields.length 
    });
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        {fields.length > 0 && (
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-music-primary/20 -ml-3"></div>
        )}
        <div className="space-y-6">
          {fields.map((field, index) => {
            const blockType = watch(`blocks.${index}.type`);
            return (
              <div key={field.id} className="relative">
                <div className="absolute left-6 top-1/2 -ml-3 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-music-primary bg-background z-10"></div>
                <Card className={cn(
                  "ml-8 overflow-hidden transition-all hover:shadow-md",
                  "bg-gradient-to-r",
                  getBgColorForType(blockType),
                  "border-l-4",
                  {
                    "border-l-orange-400": blockType === "warmup",
                    "border-l-music-primary": blockType === "technique",
                    "border-l-blue-400": blockType === "mindfulness",
                    "border-l-green-400": blockType === "creative",
                    "border-l-purple-400": blockType === "cooldown",
                  }
                )}>
                  <div className="flex justify-between items-center p-4 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-card text-white">
                        {index + 1}
                      </div>
                      <h3 className="font-medium">Block {index + 1}</h3>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => index > 0 && swap(index, index - 1)}
                        disabled={index === 0}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <ArrowUp className="h-4 w-4 transition-transform hover:translate-y-[-2px]" />
                        <span className="sr-only">Move Up</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => index < fields.length - 1 && swap(index, index + 1)}
                        disabled={index === fields.length - 1}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <ArrowDown className="h-4 w-4 transition-transform hover:translate-y-[2px]" />
                        <span className="sr-only">Move Down</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <Trash2 className="h-4 w-4 transition-opacity hover:text-red-400" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name={`blocks.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5 text-sm">
                              {getIconForType(field.value)}
                              <span>Type</span>
                            </FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-card/70 backdrop-blur-sm">
                                  <SelectValue placeholder="Select block type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {BLOCK_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <span className="flex items-center gap-2">
                                      {type.icon}
                                      {type.label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`blocks.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                className="bg-card/70 backdrop-blur-sm"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`blocks.${index}.content`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-sm">Content</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder={getPlaceholderByType(blockType)}
                                className="min-h-[100px] bg-card/70 backdrop-blur-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <Button 
        type="button" 
        variant="outline" 
        onClick={handleAddBlock} 
        className="w-full ml-8 group transition-all border-dashed border-2 hover:border-music-primary hover:bg-music-primary/5"
      >
        <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
        Add Block
      </Button>
    </div>
  );
};

export default RoutineBlockForm;
