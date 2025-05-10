
import { supabase } from "@/integrations/supabase/client";
import { PracticeGoal, CreateGoalData } from "@/types/goals";

// Fetch all goals for the current user
export async function fetchUserGoals() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("practice_goals")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching goals:", error);
    throw error;
  }

  return data.map(goal => ({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    progress: goal.progress,
    targetDate: goal.target_date,
    createdAt: goal.created_at,
    userId: goal.user_id,
    isCompleted: goal.progress >= 100
  })) as PracticeGoal[];
}

// Create a new goal
export async function createGoal(goalData: CreateGoalData) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("practice_goals")
    .insert({
      user_id: userData.user.id,
      title: goalData.title,
      description: goalData.description,
      category: goalData.category,
      progress: goalData.progress,
      target_date: goalData.targetDate
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating goal:", error);
    throw error;
  }

  return data;
}

// Update an existing goal
export async function updateGoal(goalId: string, updates: Partial<CreateGoalData>) {
  const { data, error } = await supabase
    .from("practice_goals")
    .update(transformToDbFormat(updates))
    .eq("id", goalId)
    .select()
    .single();

  if (error) {
    console.error("Error updating goal:", error);
    throw error;
  }

  return data;
}

// Delete a goal
export async function deleteGoal(goalId: string) {
  const { error } = await supabase
    .from("practice_goals")
    .delete()
    .eq("id", goalId);

  if (error) {
    console.error("Error deleting goal:", error);
    throw error;
  }

  return true;
}

// Helper function to transform camelCase to snake_case for database
function transformToDbFormat(data: Partial<CreateGoalData>) {
  const result: Record<string, any> = {};
  
  if (data.title !== undefined) result.title = data.title;
  if (data.description !== undefined) result.description = data.description;
  if (data.category !== undefined) result.category = data.category;
  if (data.progress !== undefined) result.progress = data.progress;
  if (data.targetDate !== undefined) result.target_date = data.targetDate;
  
  return result;
}
