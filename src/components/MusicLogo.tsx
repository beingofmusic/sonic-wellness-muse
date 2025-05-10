
import React from "react";

interface MusicLogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

const MusicLogo: React.FC<MusicLogoProps> = ({ size = "md", withText = false }) => {
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "h-6 w-6";
      case "lg":
        return "h-10 w-10";
      case "md":
      default:
        return "h-8 w-8";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${getSizeClass()} flex-shrink-0 text-music-primary`}>
        {/* Music note icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>

      {withText && (
        <span className="font-semibold text-lg">Being of Music</span>
      )}
    </div>
  );
};

export default MusicLogo;
