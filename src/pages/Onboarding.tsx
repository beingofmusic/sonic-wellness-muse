import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOnboarding } from "@/hooks/useOnboarding";
import beingOfMusic from "@/persona/beingOfMusic";
import { trackOnboarding } from "@/services/analyticsService";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronLeft, ChevronRight, Gift, Lightbulb, Target, BellRing, UsersRound, BookOpen, PlayCircle } from "lucide-react";

const TOTAL_STEPS = 6;

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

const DotProgress = ({ step }: { step: number }) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-4" aria-label="Onboarding progress">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${i === step ? "bg-primary" : "bg-muted"}`}
          aria-current={i === step ? "step" : undefined}
        />
      ))}
    </div>
  );
};

const chips = ["Technique", "Repertoire", "Ear Training", "Improvisation", "Wellness"] as const;

const Onboarding = () => {
  const navigate = useNavigate();
  const { status, start, complete, dismiss, save } = useOnboarding();

  const [step, setStep] = useState(0);
  const [instrument, setInstrument] = useState("");
  const [skill, setSkill] = useState("Intermediate");
  const [focus, setFocus] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [notifications, setNotifications] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const canBack = step > 0;
  const isLast = step === TOTAL_STEPS - 1;

  const next = useCallback(async () => {
    // Persist per-step events
    trackOnboarding("onboarding_step_viewed", { step: Math.min(step + 1, TOTAL_STEPS - 1) });

    // Save preferences on step 2 advance
    if (step === 2) {
      try {
        // Upsert into user_practice_preferences
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const payload: any = {
            user_id: user.user.id,
            primary_instrument: instrument || null,
            skill_level: skill.toLowerCase(),
            focus_areas: focus,
          };
          // If row exists -> update, else insert
          const { data: existing } = await supabase
            .from("user_practice_preferences")
            .select("user_id")
            .eq("user_id", user.user.id)
            .maybeSingle();

          if (existing) {
            await supabase
              .from("user_practice_preferences")
              .update({
                primary_instrument: payload.primary_instrument,
                skill_level: payload.skill_level,
                focus_areas: payload.focus_areas,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", user.user.id);
          } else {
            await supabase.from("user_practice_preferences").insert(payload);
          }

          if (goal.trim()) {
            // Store note inside energy_patterns jsonb for now (non-breaking)
            await supabase
              .from("user_practice_preferences")
              .update({
                energy_patterns: {
                  goal_note: goal.trim(),
                },
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", user.user.id);
          }

          // Save progress snapshot as well
          await save({
            preferences: {
              primary_instrument: payload.primary_instrument,
              skill_level: payload.skill_level,
              focus_areas: payload.focus_areas,
              goal_note: goal.trim() || null,
            },
          }, step + 1);
        }
      } catch (e) {
        console.warn("onboarding preferences save failed", e);
      }
    } else {
      // Save lightweight progress index
      await save({}, step + 1);
    }

    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, [step, instrument, skill, focus, goal, save]);

  const back = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  const handleSkip = useCallback(async () => {
    await dismiss();
    navigate("/dashboard", { replace: true });
  }, [dismiss, navigate]);

  const handleFinish = useCallback(async () => {
    if (notifications && "Notification" in window) {
      try { await Notification.requestPermission(); } catch {}
    }
    await complete();
    navigate("/practice", { replace: true });
  }, [complete, navigate, notifications]);

  useEffect(() => {
    setMeta();
    beingOfMusic.illustrations.forEach((img) => {
      const i = new Image();
      i.src = img.src;
      i.alt = img.alt;
    });
    start().catch(() => {});
  }, [start]);

  useEffect(() => {
    if (status === "completed" || status === "dismissed") {
      navigate("/dashboard", { replace: true });
    }
  }, [status, navigate]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, back]);

  // Swipe navigation
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current;
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (dx > 50) back();
    if (dx < -50) next();
    touchStartX.current = null;
  };

  const StepContent = useMemo(() => {
    switch (step) {
      case 0:
        return (
          <Card className="bg-card/80 backdrop-blur animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <img
                  src={beingOfMusic.illustrations[0].src}
                  alt={beingOfMusic.illustrations[0].alt}
                  className="h-12 w-12 rounded-full hover-scale"
                />
                Welcome to Being of Music
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Let’s start a light, joyful path to better practice.</p>
              <p>Short steps. Steady progress. Music that feels good.</p>
              <p>Ready when you are.</p>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={handleSkip}>Skip for now</Button>
              <Button onClick={next} aria-label="Let's begin">Let’s begin</Button>
            </CardFooter>
          </Card>
        );
      case 1:
        return (
          <Card className="bg-card/80 backdrop-blur animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" /> About Being of Music
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2"><Target className="h-4 w-4" /><span>Our Mission</span></div>
                  <p className="text-sm opacity-80">
                    To inspire, educate, and entertain current and future generations of artists around the world.
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2"><Gift className="h-4 w-4" /><span>What We Provide</span></div>
                  <ul className="text-sm opacity-80 list-disc pl-5 space-y-1">
                    <li>Live and online events</li>
                    <li>Podcast and social content</li>
                    <li>Digital courses and private lessons</li>
                    <li>E‑books and more</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2"><Lightbulb className="h-4 w-4" /><span>Core Beliefs</span></div>
                  <ul className="text-sm opacity-80 list-disc pl-5 space-y-1">
                    <li>Creativity as a way of being</li>
                    <li>Mastery needs dedication and discipline</li>
                    <li>Leadership, teamwork, ownership, accountability</li>
                    <li>Always seek growth and refinement</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={back}><ChevronLeft className="mr-1 h-4 w-4" />Back</Button>
              <Button onClick={next}>I’m ready to grow</Button>
            </CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card className="bg-card/80 backdrop-blur animate-fade-in">
            <CardHeader>
              <CardTitle>You as a Musician</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm mb-1 block">Primary instrument</label>
                <Select value={instrument} onValueChange={setInstrument}>
                  <SelectTrigger><SelectValue placeholder="Select instrument" /></SelectTrigger>
                  <SelectContent>
                    {['Piano','Guitar','Bass','Drums','Voice','Saxophone','Trumpet','Violin','Cello','Flute','Clarinet','Other'].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm mb-1 block">Skill level</label>
                <Select value={skill} onValueChange={setSkill}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {['Beginner','Intermediate','Advanced','Educator'].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm mb-2 block">Main focus today</label>
                <div className="flex flex-wrap gap-2">
                  {chips.map((c) => {
                    const active = focus.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFocus((f)=> f.includes(c) ? f.filter(x=>x!==c) : [...f, c])}
                        className={`px-3 py-1 rounded-full text-sm border ${active ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                        aria-pressed={active}
                      >
                        {active && <Check className="h-3.5 w-3.5 mr-1 inline" />} {c}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm mb-1 block">Optional goal</label>
                <Input
                  value={goal}
                  onChange={(e)=> setGoal(e.target.value)}
                  placeholder="In plain English, what do you want to improve?"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={back}><ChevronLeft className="mr-1 h-4 w-4" />Back</Button>
              <Button onClick={next}>Save & Continue</Button>
            </CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card className="bg-card/80 backdrop-blur animate-fade-in">
            <CardHeader>
              <CardTitle>Practice Tools & Guided System</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg border">
                <PlayCircle className="h-5 w-5 mb-2" />
                <p className="text-sm opacity-80">Practice Timer with metronome & drone options to keep you steady.</p>
              </div>
              <div className="p-4 rounded-lg border">
                <Target className="h-5 w-5 mb-2" />
                <p className="text-sm opacity-80">Goal tracking with progress bars and weekly targets.</p>
              </div>
              <div className="p-4 rounded-lg border">
                <BookOpen className="h-5 w-5 mb-2" />
                <p className="text-sm opacity-80">Guided routines with step‑by‑step flow and embedded media.</p>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={back}><ChevronLeft className="mr-1 h-4 w-4" />Back</Button>
              <Button onClick={() => navigate('/practice', { replace: false })}>Start a Sample Routine</Button>
            </CardFooter>
          </Card>
        );
      case 4:
        return (
          <Card className="bg-card/80 backdrop-blur animate-fade-in">
            <CardHeader>
              <CardTitle>Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {['Technique','Creativity','Mindset','Jazz Improvisation'].map((title) => (
                  <div key={title} className="rounded-lg border p-4 hover-scale">
                    <div className="font-medium mb-1">{title}</div>
                    <p className="text-xs opacity-80">In‑depth lessons to sharpen your artistry.</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={back}><ChevronLeft className="mr-1 h-4 w-4" />Back</Button>
              <Button asChild>
                <Link to="/courses">Explore Courses</Link>
              </Button>
            </CardFooter>
          </Card>
        );
      case 5:
      default:
        return (
          <Card className="bg-card/80 backdrop-blur animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersRound className="h-5 w-5" /> Community & Finish
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Join the M.U.S.E. Community—share progress, ask questions, and cheer others on.</p>
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4" />
                <label className="text-sm flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e)=> setNotifications(e.target.checked)}
                    aria-label="Enable notifications"
                  />
                  Enable notifications
                </label>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={back}><ChevronLeft className="mr-1 h-4 w-4" />Back</Button>
              <Button onClick={handleFinish}>You’re in — Start Now</Button>
            </CardFooter>
          </Card>
        );
    }
  }, [step, handleFinish, next, back, instrument, skill, focus, goal, notifications, navigate]);

  useEffect(() => {
    trackOnboarding("onboarding_step_viewed", { step });
  }, [step]);

  return (
    <>
      <header className="sr-only">
        <h1>Being of Music Onboarding</h1>
      </header>
      <main
        className="max-w-4xl mx-auto p-4 sm:p-6"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" onClick={handleSkip}>Skip</Button>
          <div className="flex items-center gap-2">
            {canBack && (
              <Button variant="outline" onClick={back} aria-label="Back">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {!isLast ? (
              <Button onClick={next} aria-label="Next">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} aria-label="Finish">
                Finish
              </Button>
            )}
          </div>
        </div>
        <DotProgress step={step} />

        <section className="mt-4" aria-live="polite">
          {StepContent}
        </section>

        <aside className="sr-only">
          <p>Learn more about our work on the About page.</p>
          <Link to="/about">About</Link>
        </aside>
      </main>
    </>
  );
};

export default Onboarding;

