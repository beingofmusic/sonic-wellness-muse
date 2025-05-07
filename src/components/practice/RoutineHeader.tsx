
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface RoutineHeaderProps {
  title: string;
  isLoading: boolean;
  totalDuration: number;
  formattedDuration: string;
  isEditing: boolean;
}

const RoutineHeader: React.FC<RoutineHeaderProps> = ({
  title,
  isLoading,
  totalDuration,
  formattedDuration,
  isEditing,
}) => {
  return (
    <div className="flex items-center justify-between sticky top-0 z-10 py-2 backdrop-blur-md bg-background/80">
      <h1 className="text-2xl md:text-3xl font-bold">
        {isEditing ? "Edit Practice Routine" : "Create New Practice Routine"}
      </h1>
      <div className="flex items-center gap-3">
        {totalDuration > 0 && (
          <div className="bg-music-primary/10 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
            <span>Total:</span>
            <span className="text-music-primary">{formattedDuration}</span>
          </div>
        )}
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="bg-gradient-to-r from-music-primary to-music-secondary hover:opacity-90 transition-all"
        >
          {isLoading ? (
            "Saving..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4 animate-pulse" />
              {isEditing ? "Update" : "Save"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RoutineHeader;
