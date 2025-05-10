
import React, { createContext, useContext, useState } from "react";
import { Badge } from "@/hooks/useUserProfile";
import BadgeNotification from "@/components/profile/BadgeNotification";
import { useBadgeNotifications } from "@/hooks/useBadgeNotifications";

interface BadgeNotificationContextType {
  showBadgeNotification: (badge: Badge) => void;
}

const BadgeNotificationContext = createContext<BadgeNotificationContextType | undefined>(undefined);

export const BadgeNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);
  const { markBadgeAsShown } = useBadgeNotifications([]);
  
  const showBadgeNotification = (badge: Badge) => {
    // First check if we've already shown this badge
    const shownBadgeIds = getShownBadgeIds();
    
    if (!shownBadgeIds.includes(badge.id)) {
      setCurrentBadge(badge);
      setShowNotification(true);
      markBadgeAsShown(badge.id);
    }
  };
  
  // Helper to get previously shown badge IDs (copied from useBadgeNotifications)
  const getShownBadgeIds = (): string[] => {
    try {
      const stored = localStorage.getItem("shown-badge-notifications");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error getting shown badges from localStorage:", error);
      return [];
    }
  };
  
  return (
    <BadgeNotificationContext.Provider value={{ showBadgeNotification }}>
      {children}
      
      {currentBadge && (
        <BadgeNotification
          badge={currentBadge}
          open={showNotification}
          onOpenChange={(open) => {
            if (!open) setShowNotification(false);
          }}
        />
      )}
    </BadgeNotificationContext.Provider>
  );
};

export const useBadgeNotificationContext = () => {
  const context = useContext(BadgeNotificationContext);
  if (context === undefined) {
    throw new Error("useBadgeNotificationContext must be used within a BadgeNotificationProvider");
  }
  return context;
};
