import React, { useState } from "react";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/useGoals";
import { PracticeGoal, GoalCategory, CreateGoalData } from "@/types/goals";
import { GoalDialog } from "./GoalDialog";
import { SuggestedGoalsDialog } from "./SuggestedGoalsDialog";
import GoalCard from "./GoalCard";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Music, FileMusic, Sparkles, Repeat, Search } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SuggestedGoal } from "@/data/suggestedGoals";

export default function PracticeGoals() {
  // State for dialogs and selected goal
  const [dialogOpen, setDialogOpen] = useState(false);
  const [suggestedGoalsOpen, setSuggestedGoalsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<PracticeGoal | undefined>(undefined);
  const [prefilledGoal, setPrefilledGoal] = useState<SuggestedGoal | undefined>(undefined);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<GoalCategory | "All Goals">("All Goals");

  // Hooks for CRUD operations
  const { goals, isLoading } = useGoals(activeCategory);
  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();

  // Handle creating or updating a goal
  const handleSaveGoal = (values: any) => {
    const goalData: CreateGoalData = {
      title: values.title,
      description: values.description,
      category: values.category,
      progress: values.progress,
      targetDate: values.targetDate ? format(values.targetDate, "yyyy-MM-dd") : null,
    };

    if (selectedGoal) {
      // Update existing goal
      updateGoalMutation.mutate({
        id: selectedGoal.id,
        updates: goalData,
      });
    } else {
      // Create new goal
      createGoalMutation.mutate(goalData);
    }
  };

  // Open edit dialog
  const handleEditGoal = (goal: PracticeGoal) => {
    setSelectedGoal(goal);
    setDialogOpen(true);
  };

  // Open delete confirmation
  const handleDeletePrompt = (goalId: string) => {
    setSelectedGoalId(goalId);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion
  const handleConfirmDelete = () => {
    if (selectedGoalId) {
      deleteGoalMutation.mutate(selectedGoalId);
      setDeleteDialogOpen(false);
    }
  };

  // Open create dialog
  const handleCreateGoal = () => {
    setSelectedGoal(undefined);
    setPrefilledGoal(undefined);
    setDialogOpen(true);
  };

  // Handle selecting a suggested goal
  const handleSelectSuggestedGoal = (suggestedGoal: SuggestedGoal) => {
    setSelectedGoal(undefined);
    setPrefilledGoal(suggestedGoal);
    setDialogOpen(true);
  };

  // Get icon for tab
  const getCategoryIcon = (category: GoalCategory | "All Goals") => {
    switch (category) {
      case "All Goals":
        return null;
      case "Technique":
        return <TrendingUp className="h-4 w-4" />;
      case "Performance":
        return <Music className="h-4 w-4" />;
      case "Repertoire":
        return <FileMusic className="h-4 w-4" />;
      case "Creativity":
        return <Sparkles className="h-4 w-4" />;
      case "Habit":
        return <Repeat className="h-4 w-4" />;
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            🎯 My Practice Goals
          </h2>
          <p className="text-white/70">Track your progress and celebrate your musical journey</p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => setSuggestedGoalsOpen(true)}
            variant="outline"
            className="border-music-primary/30 text-music-primary hover:bg-music-primary/10"
          >
            <Search className="h-4 w-4 mr-1" />
            Browse Suggested Goals
          </Button>
          <Button onClick={handleCreateGoal} className="bg-music-primary hover:bg-music-secondary">
            <Plus className="h-4 w-4 mr-1" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Category filters */}
      <Tabs 
        defaultValue="All Goals" 
        value={activeCategory} 
        onValueChange={(value) => setActiveCategory(value as GoalCategory | "All Goals")}
        className="w-full"
      >
        <TabsList className="mb-4 h-auto flex-wrap bg-background/5 border border-white/5 p-1">
          <TabsTrigger 
            value="All Goals" 
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white h-8"
          >
            All Goals
          </TabsTrigger>
          {(["Technique", "Performance", "Repertoire", "Creativity", "Habit"] as GoalCategory[]).map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white gap-1.5 h-8"
            >
              {getCategoryIcon(category)}
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Goals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {isLoading ? (
            // Loading state
            Array(3).fill(null).map((_, index) => (
              <div 
                key={`loading-${index}`}
                className="h-64 rounded-lg border border-white/10 animate-pulse bg-white/5"
              />
            ))
          ) : goals.length > 0 ? (
            // Goals list
            goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeletePrompt}
              />
            ))
          ) : (
            // Empty state
            <div className="col-span-full p-8 text-center border border-white/10 rounded-lg bg-white/5">
              <h3 className="text-lg font-medium mb-2">No goals yet</h3>
              <p className="text-white/70 mb-4">Create your first practice goal to track your progress</p>
              <Button onClick={handleCreateGoal} className="bg-music-primary hover:bg-music-secondary">
                <Plus className="h-4 w-4 mr-1" />
                Create First Goal
              </Button>
            </div>
          )}
        </div>
      </Tabs>

      {/* Browse Suggested Goals dialog */}
      <SuggestedGoalsDialog
        open={suggestedGoalsOpen}
        onOpenChange={setSuggestedGoalsOpen}
        onSelectGoal={handleSelectSuggestedGoal}
      />

      {/* Create/Edit dialog */}
      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveGoal}
        initialData={selectedGoal}
        prefilledData={prefilledGoal}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Practice Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
