
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { CalendarIcon, Music, TrendingUp, FileMusic, Sparkles, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PracticeGoal, GoalCategory } from "@/types/goals";

// Form schema for validation
const goalFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  description: z.string().max(500, "Description cannot exceed 500 characters"),
  category: z.enum(["Technique", "Performance", "Repertoire", "Creativity", "Habit"]),
  progress: z.number().min(0).max(100),
  targetDate: z.date().nullable(),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: GoalFormValues) => void;
  initialData?: PracticeGoal;
}

export function GoalDialog({ open, onOpenChange, onSave, initialData }: GoalDialogProps) {
  // Initialize form with default values or existing goal data
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          category: initialData.category,
          progress: initialData.progress,
          targetDate: initialData.targetDate ? new Date(initialData.targetDate) : null,
        }
      : {
          title: "",
          description: "",
          category: "Technique",
          progress: 0,
          targetDate: null,
        },
  });

  // Map category to icon
  const getCategoryIcon = (category: GoalCategory) => {
    switch (category) {
      case "Technique":
        return <TrendingUp className="h-4 w-4" />;
      case "Performance":
        return <Music className="h-4 w-4" />;
      case "Repertoire":
        return <FileMusic className="h-4 w-4" />;
      case "Creativity":
        return <Sparkles className="h-4 w-4" />;
      case "Habit":
        return <Repeat className="h-4 w-4" />;
    }
  };

  // Handle form submission
  const onSubmit = (values: GoalFormValues) => {
    onSave(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Practice Goal" : "Create New Practice Goal"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter goal title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your goal (optional)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-2"
                    >
                      {["Technique", "Performance", "Repertoire", "Creativity", "Habit"].map(
                        (category) => (
                          <FormItem key={category} className="flex items-center space-x-1">
                            <FormControl>
                              <RadioGroupItem
                                value={category}
                                id={`category-${category}`}
                                className="peer sr-only"
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor={`category-${category}`}
                              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border border-white/10 hover:bg-white/5 cursor-pointer peer-data-[state=checked]:bg-music-primary/20 peer-data-[state=checked]:text-music-primary peer-data-[state=checked]:border-music-primary/30"
                            >
                              {getCategoryIcon(category as GoalCategory)}
                              {category}
                            </FormLabel>
                          </FormItem>
                        )
                      )}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="progress"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Progress</FormLabel>
                    <span className="text-sm text-muted-foreground">{value}%</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[value]}
                      onValueChange={(values) => onChange(values[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Target Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? "Update Goal" : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
