import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Star, ArrowRight, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UpgradePromptProps {
  feature?: string;
  onDismiss?: () => void;
  compact?: boolean;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  feature = "premium features", 
  onDismiss,
  compact = false 
}) => {
  const { user, isSupportingMember } = useAuth();

  // Don't show if user is already a supporting member or not logged in
  if (!user || isSupportingMember) {
    return null;
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-music-primary/20 to-pink-500/20 border border-music-primary/30 rounded-lg p-4 relative">
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="absolute top-2 right-2 text-white/60 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-music-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Unlock {feature} with Supporting Member</p>
            <p className="text-xs text-white/70">Support our mission and get premium access</p>
          </div>
          <Link to="/pricing">
            <Button size="sm" className="music-button">
              Upgrade
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-music-primary/10 to-pink-500/10 border border-music-primary/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-music-primary" />
            <CardTitle className="text-lg">Become a Supporting Member</CardTitle>
            <Star className="h-5 w-5 text-music-primary" />
          </div>
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="text-white/60 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <CardDescription>
          Unlock {feature} and support our mission to enhance music education
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Supporting Member Benefits:</p>
              <ul className="text-sm text-white/80 mt-1 space-y-1">
                <li>• AI-powered practice tools</li>
                <li>• Full course library access</li>
                <li>• Premium wellness content</li>
                <li>• Supporting Member badge</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">$19</div>
              <div className="text-sm text-white/60">/month</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/pricing" className="flex-1">
              <Button className="w-full music-button">
                View Pricing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="music-button-secondary">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;