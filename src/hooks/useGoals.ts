
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchUserGoals, createGoal, updateGoal, deleteGoal } from "@/services/goalService";
import { CreateGoalData, GoalCategory } from "@/types/goals";
import { useAuth } from "@/context/AuthContext";

// Hook to fetch user's practice goals
export const useGoals = (category?: GoalCategory) => {
  const { user } = useAuth();
  
  const query = useQuery({
    queryKey: ["practice-goals", category],
    queryFn: async () => {
      const goals = await fetchUserGoals();
      
      // Filter by category if provided
      if (category && category !== 'All Goals') {
        return goals.filter(goal => goal.category === category);
      }
      
      return goals;
    },
    enabled: !!user,
  });
  
  return {
    goals: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError
  };
};

// Hook for creating a new goal
export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (goalData: CreateGoalData) => createGoal(goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practice-goals"] });
      toast.success("Goal created successfully!");
    },
    onError: (error) => {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
    }
  });
};

// Hook for updating a goal
export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateGoalData> }) => 
      updateGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practice-goals"] });
      toast.success("Goal updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating goal:", error);
      toast.error("Failed to update goal");
    }
  });
};

// Hook for deleting a goal
export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practice-goals"] });
      toast.success("Goal deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  });
};
