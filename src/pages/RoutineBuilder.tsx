
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PracticeRoutine, RoutineBlock } from "@/types/practice";

import { Layout } from "@/components/Layout";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { routineSchema, RoutineFormValues } from "@/schemas/routineSchema";
import RoutineBlockForm from "@/components/practice/RoutineBlockForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save } from "lucide-react";

const RoutineBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [routine, setRoutine] = useState<PracticeRoutine | null>(null);
  const [routineBlocks, setRoutineBlocks] = useState<RoutineBlock[]>([]);

  const form = useForm<RoutineFormValues>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      title: "",
      description: "",
      blocks: []
    },
  });

  // Calculate total duration
  const totalDuration = useMemo(() => {
    const blocks = form.watch("blocks") || [];
    return blocks.reduce((total, block) => total + (block.duration || 0), 0);
  }, [form.watch("blocks")]);

  // Format duration to hours and minutes
  const formattedDuration = useMemo(() => {
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [totalDuration]);

  // Fetch routine and blocks if id is provided
  useEffect(() => {
    const fetchRoutineData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        // Fetch routine data
        const { data: routineData, error: routineError } = await supabase
          .from("routines")
          .select("*")
          .eq("id", id)
          .single();

        if (routineError) {
          throw routineError;
        }

        // Fetch blocks for this routine
        const { data: blocksData, error: blocksError } = await supabase
          .from("routine_blocks")
          .select("*")
          .eq("routine_id", id)
          .order("order_index", { ascending: true });

        if (blocksError) {
          throw blocksError;
        }

        setRoutine(routineData);
        setRoutineBlocks(blocksData);

        // Set form values
        form.reset({
          title: routineData.title,
          description: routineData.description || "",
          blocks: blocksData.map(block => ({
            id: block.id,
            type: block.type,
            duration: block.duration,
            content: block.content || "",
            order_index: block.order_index
          }))
        });
      } catch (error) {
        console.error("Error fetching routine:", error);
        toast({
          title: "Error",
          description: "Failed to load routine data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutineData();
  }, [id, form, toast]);

  const onSubmit = async (data: RoutineFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save a routine.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Calculate total duration
      const totalDuration = data.blocks.reduce(
        (sum, block) => sum + block.duration,
        0
      );

      let routineId = id;
      
      // If editing existing routine
      if (id) {
        // Update routine
        const { error: updateError } = await supabase
          .from("routines")
          .update({
            title: data.title,
            description: data.description,
            duration: totalDuration,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (updateError) throw updateError;

        // Delete existing blocks
        const { error: deleteError } = await supabase
          .from("routine_blocks")
          .delete()
          .eq("routine_id", id);

        if (deleteError) throw deleteError;
      } 
      // If creating new routine
      else {
        // Insert new routine
        const { data: newRoutine, error: insertError } = await supabase
          .from("routines")
          .insert({
            title: data.title,
            description: data.description,
            duration: totalDuration,
            created_by: user.id,
            is_template: false,
            tags: [],
          })
          .select("id")
          .single();

        if (insertError) throw insertError;
        routineId = newRoutine.id;
      }

      // Insert blocks
      const blocksToInsert = data.blocks.map((block, index) => ({
        routine_id: routineId,
        order_index: index,
        type: block.type,
        content: block.content,
        duration: block.duration,
      }));

      const { error: blocksError } = await supabase
        .from("routine_blocks")
        .insert(blocksToInsert);

      if (blocksError) throw blocksError;

      toast({
        title: "Success",
        description: id ? "Routine updated successfully." : "Routine created successfully.",
      });

      // Navigate back to practice page
      navigate("/practice");
    } catch (error) {
      console.error("Error saving routine:", error);
      toast({
        title: "Error",
        description: "Failed to save routine. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If loading and we have an ID, show loading state
  if (isLoading && id) {
    return (
      <Layout>
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Loading Routine...</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl">
        <div className="mb-8 space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {id ? "Edit Practice Routine" : "Create New Practice Routine"}
            </h1>
            {totalDuration > 0 && (
              <div className="bg-music-primary/10 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
                <span>Total Duration:</span>
                <span className="text-music-primary">{formattedDuration}</span>
              </div>
            )}
          </div>
          <p className="text-white/60">
            Design your custom practice routine by adding blocks of different activities below
          </p>
        </div>

        <Card className="bg-card/70 backdrop-blur-md border-white/10">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Routine Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter routine title" 
                            className="text-lg bg-card/80 backdrop-blur-sm" 
                            {...field} 
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
                        <FormLabel className="text-base">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What's this routine for? What will it help you achieve?" 
                            className="min-h-[80px] bg-card/80 backdrop-blur-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-2">Routine Blocks</span>
                    {form.watch("blocks").length > 0 && (
                      <span className="text-white/60 text-sm font-normal">
                        ({form.watch("blocks").length} {form.watch("blocks").length === 1 ? 'block' : 'blocks'})
                      </span>
                    )}
                  </h2>
                  <RoutineBlockForm />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-gradient-to-r from-music-primary to-music-secondary hover:opacity-90 transition-all"
                >
                  {isLoading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4 animate-pulse" />
                      {id ? "Update Routine" : "Save Routine"}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RoutineBuilder;
