import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { trackOnboarding } from "@/services/analyticsService";

export type OnboardingStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "dismissed";

export const useOnboarding = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [progress, setProgress] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("onboarding_status")
        .eq("id", user.id)
        .single();
      if (pErr) {
        console.warn("load onboarding status error", pErr);
      }
      const s = (profile?.onboarding_status as OnboardingStatus) ?? "not_started";
      setStatus(s);

      const { data: prog, error: gErr } = await supabase
        .from("onboarding_progress")
        .select("data,current_step")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!gErr && prog) {
        setProgress(prog.data ?? {});
        setCurrentStep(prog.current_step ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const shouldOpenOnboarding = useMemo(() => {
    return status === "not_started" || status === "in_progress";
  }, [status]);

  const setStatusRemote = useCallback(
    async (next: OnboardingStatus) => {
      if (!user) return;
      await supabase.rpc("set_onboarding_status", { p_status: next as any });
      setStatus(next);
    },
    [user]
  );

  const start = useCallback(async () => {
    await setStatusRemote("in_progress");
  }, [setStatusRemote]);

  const complete = useCallback(async () => {
    await setStatusRemote("completed");
    trackOnboarding("onboarding_completed");
  }, [setStatusRemote]);

  const dismiss = useCallback(async () => {
    await setStatusRemote("dismissed");
    trackOnboarding("onboarding_skipped");
  }, [setStatusRemote]);

  const save = useCallback(
    async (data: any, step?: number) => {
      if (!user) return;
      await supabase.rpc("save_onboarding_progress", {
        p_data: data as any,
        p_current_step: step ?? null
      });
      if (step !== undefined) setCurrentStep(step);
      setProgress((prev: any) => ({ ...(prev ?? {}), ...(data ?? {}) }));
    },
    [user]
  );

  return {
    loading,
    status,
    currentStep,
    progress,
    shouldOpenOnboarding,
    reload: load,
    start,
    complete,
    dismiss,
    save
  } as const;
};

export default useOnboarding;
