import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/useOnboarding";
import beingOfMusic from "@/persona/beingOfMusic";
import { trackOnboarding } from "@/services/analyticsService";

const setMeta = () => {
  document.title = "Onboarding – Being of Music";
  const desc =
    "Start your Being of Music journey: quick setup for practice, wellness, and community.";
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", desc);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", window.location.href);
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { status, start, complete, dismiss } = useOnboarding();

  useEffect(() => {
    setMeta();
    trackOnboarding("onboarding_step_viewed", { step: 0, status });
    // Preload persona imagery (no UI yet)
    beingOfMusic.illustrations.forEach((img) => {
      const i = new Image();
      i.src = img.src;
      i.alt = img.alt;
    });
    start().catch(() => {});
  }, [status, start]);

  const handleSkip = async () => {
    await dismiss();
    navigate("/dashboard", { replace: true });
  };

  const handleFinish = async () => {
    await complete();
    navigate("/dashboard", { replace: true });
  };

  return (
    <>
      <header>
        <h1 className="sr-only">Being of Music Onboarding</h1>
      </header>
      <main className="max-w-2xl mx-auto p-6">
        <section aria-labelledby="onboarding-title">
          <h2 id="onboarding-title" className="text-lg font-medium">
            Onboarding placeholder
          </h2>
          <p className="mt-2 text-sm opacity-80">
            Framework in place. UI to come. You can skip or finish now.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={handleSkip} aria-label="Skip onboarding for now">
              Skip for now
            </Button>
            <Button onClick={handleFinish} aria-label="Finish onboarding">
              Finish
            </Button>
          </div>
        </section>
      </main>
    </>
  );
};

export default Onboarding;
