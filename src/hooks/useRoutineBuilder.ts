
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PracticeRoutine, RoutineBlock } from "@/types/practice";
import { routineSchema, RoutineFormValues, BlockFormValues } from "@/schemas/routineSchema";

export const useRoutineBuilder = (routineId?: string) => {
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
      visibility: "public",
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

  // Handle adding a template block
  const handleAddTemplateBlock = (block: Omit<BlockFormValues, "order_index">) => {
    const currentBlocks = form.getValues("blocks") || [];
    form.setValue("blocks", [
      ...currentBlocks,
      {
        ...block,
        order_index: currentBlocks.length
      }
    ]);
    toast({
      title: "Block added",
      description: "Template block added to your routine",
    });
  };

  // Fetch routine and blocks if id is provided
  useEffect(() => {
    const fetchRoutineData = async () => {
      if (!routineId) return;
      
      setIsLoading(true);
      
      try {
        // Fetch routine data
        const { data: routineData, error: routineError } = await supabase
          .from("routines")
          .select("*")
          .eq("id", routineId)
          .single();

        if (routineError) {
          throw routineError;
        }

        // Fetch blocks for this routine
        const { data: blocksData, error: blocksError } = await supabase
          .from("routine_blocks")
          .select("*")
          .eq("routine_id", routineId)
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
          visibility: (routineData.visibility as "public" | "private") || "public",
          blocks: blocksData.map(block => ({
            id: block.id,
            type: block.type,
            duration: block.duration,
            content: block.content || "",
            instructions: block.instructions || "",
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
  }, [routineId, form, toast]);

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

      let savedRoutineId = routineId;
      
      // If editing existing routine
      if (routineId) {
        // Update routine
        const { error: updateError } = await supabase
          .from("routines")
          .update({
            title: data.title,
            description: data.description,
            visibility: data.visibility,
            duration: totalDuration,
            updated_at: new Date().toISOString(),
          })
          .eq("id", routineId);

        if (updateError) throw updateError;

        // Delete existing blocks
        const { error: deleteError } = await supabase
          .from("routine_blocks")
          .delete()
          .eq("routine_id", routineId);

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
            visibility: data.visibility,
            duration: totalDuration,
            created_by: user.id,
            is_template: false,
            tags: [],
          })
          .select("id")
          .single();

        if (insertError) throw insertError;
        savedRoutineId = newRoutine.id;
      }

      // Insert blocks
      const blocksToInsert = data.blocks.map((block, index) => ({
        routine_id: savedRoutineId,
        order_index: index,
        type: block.type,
        content: block.content,
        instructions: block.instructions || "",
        duration: block.duration,
      }));

      const { error: blocksError } = await supabase
        .from("routine_blocks")
        .insert(blocksToInsert);

      if (blocksError) throw blocksError;

      toast({
        title: "Success",
        description: routineId ? "Routine updated successfully." : "Routine created successfully.",
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

  return {
    form,
    isLoading,
    routine,
    routineBlocks,
    totalDuration,
    formattedDuration,
    handleAddTemplateBlock,
    onSubmit,
    isEditing: !!routineId
  };
};
