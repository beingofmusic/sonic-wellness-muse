
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MusicLogo from "@/components/MusicLogo";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <MusicLogo size="lg" withText />
        
        <h1 className="text-3xl font-bold mt-8 mb-4">Page Not Found</h1>
        <p className="text-white/70 mb-8">
          The page you were looking for doesn't exist or has been moved.
        </p>
        
        <Link to="/">
          <Button className="music-button inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
