
import React from "react";
import { Loader } from "lucide-react";

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <Loader className="h-10 w-10 text-music-primary animate-spin mb-4" />
      <h2 className="text-xl font-medium">Loading practice session...</h2>
      <p className="text-white/60 mt-2">Preparing your routine for an optimal practice experience</p>
    </div>
  );
};

export default LoadingState;
