
import React from "react";
import { Music } from "lucide-react";

interface MusicLogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

const MusicLogo: React.FC<MusicLogoProps> = ({ size = "md", withText = true }) => {
  const logoSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl"
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`rounded-full bg-music-primary/20 p-2 ${withText ? logoSizes[size] : ""}`}>
        <Music className={`text-music-primary ${!withText ? logoSizes[size] : "h-full w-full"}`} />
      </div>
      {withText && (
        <span className={`font-serif font-medium ${textSizes[size]}`}>
          Being of Music
        </span>
      )}
    </div>
  );
};

export default MusicLogo;
