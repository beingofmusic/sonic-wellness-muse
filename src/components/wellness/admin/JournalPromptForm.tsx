import React from "react";
import { JournalPrompt } from "@/types/wellness";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCreateJournalPrompt, useUpdateJournalPrompt } from "@/hooks/useWellnessAdmin";

const promptFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["self_composition", "values", "resistance", "learning"]),
  duration_minutes: z.number().min(1, "Duration must be at least 1 minute"),
  prompt_text: z.string().min(1, "Prompt text is required"),
});

type PromptFormData = z.infer<typeof promptFormSchema>;

interface JournalPromptFormProps {
  prompt?: JournalPrompt;
  onClose: () => void;
  onSuccess: () => void;
}

const JournalPromptForm: React.FC<JournalPromptFormProps> = ({
  prompt,
  onClose,
  onSuccess,
}) => {
  const createPrompt = useCreateJournalPrompt();
  const updatePrompt = useUpdateJournalPrompt();
  const isEditing = !!prompt;

  const form = useForm<PromptFormData>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      title: prompt?.title || "",
      description: prompt?.description || "",
      type: prompt?.type || "self_composition",
      duration_minutes: prompt?.duration_minutes || 15,
      prompt_text: prompt?.prompt_text || "",
    },
  });

  const onSubmit = async (data: PromptFormData) => {
    try {
      if (isEditing) {
        await updatePrompt.mutateAsync({
          id: prompt.id,
          ...data,
        });
      } else {
        await createPrompt.mutateAsync(data as Omit<JournalPrompt, 'id'>);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving prompt:", error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Journal Prompt" : "Create New Journal Prompt"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter prompt title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select prompt type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="self_composition">🎵 Self Composition</SelectItem>
                      <SelectItem value="values">💎 Values</SelectItem>
                      <SelectItem value="resistance">💪 Resistance</SelectItem>
                      <SelectItem value="learning">📚 Learning</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="15"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
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
                      placeholder="Enter prompt description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the journal prompt content"
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPrompt.isPending || updatePrompt.isPending}
              >
                {isEditing ? "Update" : "Create"} Prompt
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default JournalPromptForm;