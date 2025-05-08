
import { supabase } from "@/integrations/supabase/client";

export interface PracticeReflection {
  id: string;
  user_id: string;
  routine_id: string;
  reflection_text: string;
  created_at: string;
}

export const saveReflection = async (
  routineId: string,
  reflectionText: string
): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return false;
    }

    const { error } = await supabase.from("practice_reflections").insert({
      user_id: userData.user.id,
      routine_id: routineId,
      reflection_text: reflectionText,
    });

    if (error) {
      console.error("Error saving reflection:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to save reflection:", err);
    return false;
  }
};
