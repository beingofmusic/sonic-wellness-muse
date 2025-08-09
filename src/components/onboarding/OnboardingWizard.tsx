import React, { useMemo, useState, useEffect } from "react";
import { useOnboarding, OnboardingData } from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const STEPS = [
  "welcome",
  "personalize",
  "practice_plan",
  "goal_commit",
  "community",
  "course",
  "complete",
] as const;

type StepKey = typeof STEPS[number];

const StepIndicator: React.FC<{ index: number; total: number }> = ({ index, total }) => {
  const pct = Math.round(((index + 1) / total) * 100);
  return (
    <div className="mb-6">
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 text-sm text-muted-foreground">Step {index + 1} of {total}</div>
    </div>
  );
};

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { showWizard, status, saveStepData, upsertPracticePreferences, completeOnboarding } = useOnboarding();

  const startData = (status?.data || {}) as OnboardingData;
  const [stepIndex, setStepIndex] = useState<number>(status?.current_step ?? 0);

  const [instruments, setInstruments] = useState<string[]>(startData.instruments || []);
  const [instrumentInput, setInstrumentInput] = useState("");
  const [skill, setSkill] = useState<OnboardingData["skill_level"]>(startData.skill_level || "beginner");
  const [genres, setGenres] = useState<string[]>(startData.genres || []);
  const [goals, setGoals] = useState<string[]>(startData.goals || []);
  const [practiceTime, setPracticeTime] = useState<OnboardingData["practice_time"]>(startData.practice_time || "evening");
  const [weeklyGoal, setWeeklyGoal] = useState<number>(startData.weekly_practice_minutes_goal || 120);
  const [streakTarget, setStreakTarget] = useState<number>(startData.streak_target || 5);

  const totalSteps = useMemo(() => 6, []); // not counting the final celebration screen here

  useEffect(() => {
    if (typeof status?.current_step === 'number') {
      setStepIndex(status.current_step);
    }
  }, [status?.current_step]);

  if (!showWizard) return null;

  const addInstrument = () => {
    const v = instrumentInput.trim();
    if (!v) return;
    if (!instruments.includes(v)) setInstruments([...instruments, v]);
    setInstrumentInput("");
  };
  const removeInstrument = (name: string) => setInstruments(instruments.filter((i) => i !== name));

  const toggle = (list: string[], setter: (v: string[]) => void, value: string) => {
    setter(list.includes(value) ? list.filter((g) => g !== value) : [...list, value]);
  };

  const handleNext = async () => {
    const partial: OnboardingData = {
      instruments,
      skill_level: skill,
      genres,
      goals,
      practice_time: practiceTime,
      weekly_practice_minutes_goal: weeklyGoal,
      streak_target: streakTarget,
    };
    const next = Math.min(stepIndex + 1, totalSteps);
    await saveStepData(partial, next);
    setStepIndex(next);

    // When leaving goal-commit step, persist preferences
    if (STEPS[stepIndex] === "goal_commit") {
      await upsertPracticePreferences(partial);
    }
  };

  const handleBack = async () => {
    const prev = Math.max(stepIndex - 1, 0);
    await saveStepData({}, prev);
    setStepIndex(prev);
  };

  const handleStartPractice = async () => {
    await completeOnboarding();
    navigate("/practice");
  };

  const handleOpenCommunity = async () => {
    await saveStepData({}, stepIndex);
    navigate("/community");
  };

  const handleStartCourse = async () => {
    await completeOnboarding();
    navigate("/courses");
  };

  const renderWelcome = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome to Being of Music</h1>
      <p className="text-muted-foreground">
        Enter a space where artistry meets wellbeing. We learn, practice, and grow—together. Your musical journey
        begins with small steps, steady rhythms, and a supportive community.
      </p>
      <div className="flex flex-wrap gap-2">
        {[
          "Artistry", "Love", "Unity", "Growth", "Connection"
        ].map((k) => (
          <Badge key={k} variant="secondary">{k}</Badge>
        ))}
      </div>
      <div className="flex gap-3">
        <Button onClick={handleNext}>Begin</Button>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>Skip for now</Button>
      </div>
    </div>
  );

  const renderPersonalize = () => (
    <div className="space-y-6">
      <div>
        <Label>Primary Instrument(s)</Label>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="e.g. Violin"
            value={instrumentInput}
            onChange={(e) => setInstrumentInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addInstrument(); }}
          />
          <Button type="button" onClick={addInstrument}>Add</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {instruments.map((ins) => (
            <Badge key={ins} variant="secondary" onClick={() => removeInstrument(ins)} className="cursor-pointer">
              {ins} ✕
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Skill Level</Label>
        <div className="mt-2 flex gap-2 flex-wrap">
          {(["beginner", "intermediate", "advanced", "pro"] as const).map((lvl) => (
            <Button
              key={lvl}
              type="button"
              variant={skill === lvl ? "default" : "outline"}
              onClick={() => setSkill(lvl)}
            >
              {lvl[0].toUpperCase() + lvl.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label>Favorite Genres</Label>
        <div className="mt-2 flex gap-2 flex-wrap">
          {["Classical", "Jazz", "Pop", "Rock", "Film", "World"].map((g) => (
            <Button
              key={g}
              type="button"
              variant={genres.includes(g) ? "default" : "outline"}
              onClick={() => toggle(genres, setGenres, g)}
            >
              {g}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label>Practice Time Preference</Label>
        <div className="mt-2 flex gap-2 flex-wrap">
          {(["morning", "afternoon", "evening", "late_night"] as const).map((t) => (
            <Button
              key={t}
              type="button"
              variant={practiceTime === t ? "default" : "outline"}
              onClick={() => setPracticeTime(t)}
            >
              {t.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={handleBack}>Back</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );

  const renderPracticePlan = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Choose Your First Practice Plan</h2>
      <p className="text-muted-foreground">Get started with a guided routine or browse templates. You can always customize later.</p>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Auto-generate a Routine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">We’ll craft a beginner-friendly plan tailored to your profile.</p>
            <Button onClick={() => { saveStepData({}, stepIndex); navigate("/ai-routine"); }}>Generate with AI</Button>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Browse Routine Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Explore curated templates from warm-ups to mindfulness.</p>
            <Button variant="outline" onClick={() => { saveStepData({}, stepIndex); navigate("/templates"); }}>Explore Templates</Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={handleBack}>Back</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );

  const renderGoalCommit = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Set Your Weekly Practice Goal</h2>
      <p className="text-muted-foreground">Commit to a rhythm you can keep—small steps, steady progress.</p>

      <div>
        <Label>Weekly Minutes: {weeklyGoal} min</Label>
        <Slider value={[weeklyGoal]} min={30} max={600} step={15} onValueChange={(v) => setWeeklyGoal(v[0])} className="mt-4" />
      </div>

      <div>
        <Label>Streak Target: {streakTarget} days/week</Label>
        <Slider value={[streakTarget]} min={3} max={7} step={1} onValueChange={(v) => setStreakTarget(v[0])} className="mt-4" />
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={handleBack}>Back</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );

  const renderCommunity = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Join the M.U.S.E. Community</h2>
      <p className="text-muted-foreground">Say hello, share your goals, and meet fellow musicians cheering you on.</p>

      <div className="flex gap-3">
        <Button onClick={handleOpenCommunity}>Open Community</Button>
        <Button variant="outline" onClick={handleNext}>I’ll do it later</Button>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={handleBack}>Back</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );

  const renderCourse = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Start Your First Course</h2>
      <p className="text-muted-foreground">We recommend exploring beginner-friendly lessons to build early wins.</p>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Beginner Essentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">A gentle path through core techniques and musicality.</p>
            <Button onClick={handleStartCourse}>Start Now</Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={handleBack}>Back</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="space-y-6 text-center">
      <h2 className="text-xl font-semibold">You’re in! 🎶</h2>
      <p className="text-muted-foreground">Onboarding complete. Your Welcome Badge awaits—let’s begin your first streak day.</p>
      <div className="flex gap-3 justify-center">
        <Button onClick={handleStartPractice}>Start a Practice</Button>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
    </div>
  );

  const renderStep = (key: StepKey) => {
    switch (key) {
      case "welcome":
        return renderWelcome();
      case "personalize":
        return renderPersonalize();
      case "practice_plan":
        return renderPracticePlan();
      case "goal_commit":
        return renderGoalCommit();
      case "community":
        return renderCommunity();
      case "course":
        return renderCourse();
      case "complete":
        return renderComplete();
      default:
        return null;
    }
  };

  const key = STEPS[Math.min(stepIndex, STEPS.length - 1)];

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 animate-fade-in">
      <div className="mx-auto max-w-2xl md:max-w-3xl px-4 py-6 md:py-10">
        <StepIndicator index={Math.min(stepIndex, totalSteps - 1)} total={totalSteps} />
        <div className="rounded-xl border bg-card/80 backdrop-blur p-5 md:p-8 shadow-xl">
          {renderStep(key)}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
