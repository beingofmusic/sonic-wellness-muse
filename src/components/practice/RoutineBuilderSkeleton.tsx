
import React from "react";

const RoutineBuilderSkeleton: React.FC = () => {
  return (
    <div className="container max-w-6xl py-4">
      <h1 className="text-3xl font-bold mb-6">Loading Routine...</h1>
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-24 bg-muted rounded"></div>
        <div className="h-32 bg-muted rounded"></div>
        <div className="h-32 bg-muted rounded"></div>
      </div>
    </div>
  );
};

export default RoutineBuilderSkeleton;
