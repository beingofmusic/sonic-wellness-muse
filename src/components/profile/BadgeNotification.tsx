
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/hooks/useUserProfile";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface BadgeNotificationProps {
  badge: Badge;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({ 
  badge, 
  open, 
  onOpenChange 
}) => {
  const handleShare = () => {
    const shareMessage = `Just earned the ${badge.title} badge on Being of Music! 🎶 Loving the journey so far!`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'Badge Earned!',
        text: shareMessage,
        url: window.location.origin
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(shareMessage)
        .then(() => toast.success("Share message copied to clipboard!"))
        .catch(() => toast.error("Could not copy to clipboard"));
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span className="text-2xl mr-2">🎉</span>
            Badge Earned!
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Congratulations on your achievement!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <div className="rounded-full bg-music-primary/20 p-4 mb-3 text-center">
            {badge.icon ? (
              <span className="text-4xl">{badge.icon}</span>
            ) : (
              <span className="text-4xl">🏆</span>
            )}
          </div>
          <h3 className="text-xl font-bold text-center mb-2">{badge.title}</h3>
          <p className="text-white/70 text-center mb-4">{badge.description}</p>
          <p className="text-center text-lg font-medium mt-2 mb-4">
            🎉 Congrats! You've just earned the {badge.title} badge!
          </p>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            onClick={handleShare} 
            className="gap-2 bg-music-primary hover:bg-music-primary/80"
          >
            <Share2 className="h-4 w-4" />
            Share Achievement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeNotification;
