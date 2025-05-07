
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
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { RoutineFormValues } from "@/schemas/routineSchema";

const BLOCK_TYPES = [
  { value: "warmup", label: "Warm-up" },
  { value: "technique", label: "Technique" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "creative", label: "Creative" },
  { value: "cooldown", label: "Cool-down" },
];

const RoutineBlockForm: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<RoutineFormValues>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "blocks",
  });

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
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-md bg-card shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Block {index + 1}</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => index > 0 && swap(index, index - 1)}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => index < fields.length - 1 && swap(index, index + 1)}
                  disabled={index === fields.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`blocks.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select block type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BLOCK_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
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
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter instructions or cues for this block" 
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>

      <Button 
        type="button" 
        variant="outline" 
        onClick={handleAddBlock} 
        className="w-full"
      >
        Add Block
      </Button>
    </div>
  );
};

export default RoutineBlockForm;
