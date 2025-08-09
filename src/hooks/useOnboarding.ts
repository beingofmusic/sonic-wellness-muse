import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type OnboardingData = {
  instruments?: string[];
  skill_level?: "beginner" | "intermediate" | "advanced" | "pro";
  goals?: string[];
  genres?: string[];
  practice_time?: "morning" | "afternoon" | "evening" | "late_night";
  weekly_practice_minutes_goal?: number;
  streak_target?: number;
};

export interface OnboardingStatus {
  user_id: string;
  current_step: number;
  completed: boolean;
  data: OnboardingData;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  
  const { toast } = useToast();

  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const showWizard = useMemo(() => {
    if (!user) return false;
    if (!status) return false; // wait until we fetch
    return !status.completed;
  }, [user, status]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from("onboarding_status" as any)
          .select("user_id, current_step, completed, data, created_at, updated_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          // initialize a row for this user
          const init: OnboardingStatus = {
            user_id: user.id,
            current_step: 0,
            completed: false,
            data: {},
          };
          const { error: insertError } = await (supabase as any)
            .from("onboarding_status" as any)
            .insert(init as any);
          if (insertError) throw insertError;
          if (isMounted) setStatus(init);
        } else {
          if (isMounted) setStatus(data as OnboardingStatus);
        }
      } catch (err) {
        console.error("Failed to fetch onboarding status", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const saveStepData = async (partial: OnboardingData, nextStep?: number) => {
    if (!user || !status) return;
    const newData = { ...(status.data || {}), ...partial } as OnboardingData;
    const update: Partial<OnboardingStatus> = {
      data: newData,
      current_step: typeof nextStep === "number" ? nextStep : status.current_step,
    };
    const { error } = await (supabase as any)
      .from("onboarding_status" as any)
      .update(update as any)
      .eq("user_id", user.id);
    if (error) {
      console.error("Failed to save onboarding data", error);
      toast({ title: "Save failed", description: "Please try again.", variant: "destructive" });
      return;
    }
    setStatus((prev) => (prev ? { ...prev, ...update } as OnboardingStatus : prev));
  };

  const upsertPracticePreferences = async (data: OnboardingData) => {
    if (!user) return;
    // Try to find existing preferences for this user
    const { data: pref, error: prefErr } = await supabase
      .from("user_practice_preferences")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (prefErr) {
      console.error("Failed to fetch preferences", prefErr);
      return;
    }

    const payload: any = {
      user_id: user.id,
      primary_instrument: data.instruments?.[0] ?? null,
      skill_level: data.skill_level ?? null,
      preferred_practice_time: data.practice_time ?? null,
      focus_areas: data.genres ?? null,
      weekly_practice_minutes_goal: data.weekly_practice_minutes_goal ?? 120,
      typical_practice_duration: Math.min(Math.max(Math.round((data.weekly_practice_minutes_goal ?? 120) / 4), 15), 90),
    };

    if (pref?.id) {
      const { error } = await supabase
        .from("user_practice_preferences")
        .update(payload)
        .eq("id", pref.id);
      if (error) console.error("Failed to update preferences", error);
    } else {
      const { error } = await supabase
        .from("user_practice_preferences")
        .insert(payload);
      if (error) console.error("Failed to insert preferences", error);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Mark as complete via RPC (also awards badge)
      const { error } = await supabase.rpc("complete_onboarding");
      if (error) throw error;

      // Refresh status
      const { data } = await (supabase as any)
        .from("onboarding_status" as any)
        .select("user_id, current_step, completed, data, created_at, updated_at")
        .eq("user_id", user.id)
        .single();
      setStatus(data as OnboardingStatus);

      toast({
        title: "Welcome to Being of Music!",
        description: "Onboarding complete. Your Welcome Badge has been awarded.",
      });

      // Gentle nudge to start a practice or join community
      setTimeout(() => {
        toast({
          title: "Daily Practice",
          description: "Kick off your first streak day with a short practice session.",
        });
      }, 600);

    } catch (err) {
      console.error("Failed to complete onboarding", err);
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    showWizard,
    status,
    saveStepData,
    upsertPracticePreferences,
    completeOnboarding,
  };
};
