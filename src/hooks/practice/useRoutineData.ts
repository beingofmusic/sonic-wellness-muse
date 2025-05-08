
import { useState, useEffect } from "react";
import { PracticeRoutine, RoutineBlock } from "@/types/practice";
import { fetchRoutineById, fetchRoutineBlocks } from "@/services/practiceService";
import { useToast } from "@/hooks/use-toast";

export const useRoutineData = (routineId?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [routine, setRoutine] = useState<PracticeRoutine | null>(null);
  const [blocks, setBlocks] = useState<RoutineBlock[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRoutineData = async () => {
      if (!routineId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const routineData = await fetchRoutineById(routineId);
        const blocksData = await fetchRoutineBlocks(routineId);
        
        setRoutine(routineData);
        setBlocks(blocksData);
      } catch (error) {
        console.error("Error fetching routine data:", error);
        toast({
          title: "Error",
          description: "Failed to load routine data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutineData();
  }, [routineId, toast]);

  return {
    isLoading,
    routine,
    blocks
  };
};
