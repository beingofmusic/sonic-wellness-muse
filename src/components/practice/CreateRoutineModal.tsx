import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Zap, Settings, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CreateRoutineButtonProps {
  label?: string;
  size?: ButtonProps["size"];
  className?: string;
  variant?: ButtonProps["variant"];
}

export const CreateRoutineButton: React.FC<CreateRoutineButtonProps> = ({
  label = "Create Routine",
  size = "default",
  className,
  variant,
}) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant} className={cn("px-6", className)}>
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-md border-white/10 animate-enter">
        <DialogHeader>
          <DialogTitle>Create a Routine</DialogTitle>
          <DialogDescription>
            Select how you want to start. You can switch methods later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start hover-scale"
            onClick={() => go("/practice/ai-routine")}
          >
            <Zap className="h-4 w-4 text-accent" />
            Use AI Generator
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start hover-scale"
            onClick={() => go("/practice/routine-builder")}
          >
            <Settings className="h-4 w-4 text-primary" />
            Build Manually
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start hover-scale"
            onClick={() => go("/practice/templates")}
          >
            <BookOpen className="h-4 w-4 text-secondary" />
            Start from Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoutineButton;
