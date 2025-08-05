import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface RecordingChoiceDialogProps {
  isOpen: boolean;
  onChoice: (shouldRecord: boolean) => void;
}

const RecordingChoiceDialog: React.FC<RecordingChoiceDialogProps> = ({
  isOpen,
  onChoice,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Record Practice Session?</DialogTitle>
          <DialogDescription className="text-center">
            Would you like to record this practice session? You can save and review your recording later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={() => onChoice(true)}
            className="w-full bg-music-primary hover:bg-music-secondary flex items-center gap-2"
          >
            <Mic className="h-4 w-4" />
            Yes, record my session
          </Button>
          
          <Button
            onClick={() => onChoice(false)}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <MicOff className="h-4 w-4" />
            No, do not record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingChoiceDialog;