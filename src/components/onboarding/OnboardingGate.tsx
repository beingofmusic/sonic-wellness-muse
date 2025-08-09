import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { trackOnboarding } from "@/services/analyticsService";

const BLOCKED_PATHS = new Set(["/signin", "/signup", "/onboarding"]);

const OnboardingGate = () => {
  const { user } = useAuth();
  const { shouldOpenOnboarding, loading, status } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const openedOnce = useRef(false);

  useEffect(() => {
    if (!user || loading) return;
    if (BLOCKED_PATHS.has(location.pathname)) return;

    if (shouldOpenOnboarding) {
      navigate("/onboarding", { replace: true, state: { from: location } });
      if (!openedOnce.current) {
        openedOnce.current = true;
        trackOnboarding("onboarding_opened", { status });
      }
    }
  }, [user, loading, shouldOpenOnboarding, navigate, location, status]);

  return null;
};

export default OnboardingGate;
