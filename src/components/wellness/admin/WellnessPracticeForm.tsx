import React from "react";
import { WellnessPractice } from "@/types/wellness";
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
import { useCreateWellnessPractice, useUpdateWellnessPractice } from "@/hooks/useWellnessAdmin";

const practiceFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["meditation", "breathwork", "yoga_fitness"]),
  duration_minutes: z.number().min(1, "Duration must be at least 1 minute"),
  content: z.string().min(1, "Content is required"),
  image_url: z.string().optional(),
});

type PracticeFormData = z.infer<typeof practiceFormSchema>;

interface WellnessPracticeFormProps {
  practice?: WellnessPractice;
  onClose: () => void;
  onSuccess: () => void;
}

const WellnessPracticeForm: React.FC<WellnessPracticeFormProps> = ({
  practice,
  onClose,
  onSuccess,
}) => {
  const createPractice = useCreateWellnessPractice();
  const updatePractice = useUpdateWellnessPractice();
  const isEditing = !!practice;

  const form = useForm<PracticeFormData>({
    resolver: zodResolver(practiceFormSchema),
    defaultValues: {
      title: practice?.title || "",
      description: practice?.description || "",
      type: practice?.type || "meditation",
      duration_minutes: practice?.duration_minutes || 10,
      content: practice?.content || "",
      image_url: practice?.image_url || "",
    },
  });

  const onSubmit = async (data: PracticeFormData) => {
    try {
      if (isEditing) {
        await updatePractice.mutateAsync({
          id: practice.id,
          ...data,
        });
      } else {
        await createPractice.mutateAsync(data as Omit<WellnessPractice, 'id'>);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving practice:", error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Wellness Practice" : "Create New Wellness Practice"}
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
                    <Input placeholder="Enter practice title" {...field} />
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
                        <SelectValue placeholder="Select practice type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="meditation">🧘 Meditation</SelectItem>
                      <SelectItem value="breathwork">🌬️ Breathwork</SelectItem>
                      <SelectItem value="yoga_fitness">🧘‍♀️ Yoga & Fitness</SelectItem>
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
                      placeholder="10"
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
                      placeholder="Enter practice description"
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the practice content/instructions"
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
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
                disabled={createPractice.isPending || updatePractice.isPending}
              >
                {isEditing ? "Update" : "Create"} Practice
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WellnessPracticeForm;