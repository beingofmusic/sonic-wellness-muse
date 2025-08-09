export type OnboardingEvent =
  | "onboarding_opened"
  | "onboarding_step_viewed"
  | "onboarding_completed"
  | "onboarding_skipped";

export const trackOnboarding = (
  event: OnboardingEvent,
  payload: Record<string, any> = {}
) => {
  try {
    // Lightweight client-side analytics placeholder
    console.info(`[analytics] ${event}`, { ...payload, ts: Date.now() });
  } catch (e) {
    // Never break UX for analytics
    console.warn("[analytics] failed", e);
  }
};
