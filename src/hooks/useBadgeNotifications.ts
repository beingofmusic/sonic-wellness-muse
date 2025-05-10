
import { useState, useEffect } from "react";
import { Badge } from "@/hooks/useUserProfile";

interface BadgeNotificationState {
  showNotification: boolean;
  currentBadge: Badge | null;
}

// Key used to store already shown badge notifications
const SHOWN_BADGES_KEY = "shown-badge-notifications";

export const useBadgeNotifications = (badges: Badge[]) => {
  const [notificationState, setNotificationState] = useState<BadgeNotificationState>({
    showNotification: false,
    currentBadge: null
  });
  
  // Check for new badges when the badges array changes
  useEffect(() => {
    // Skip if no badges or notification is already showing
    if (badges.length === 0 || notificationState.showNotification) return;
    
    // Get previously shown badge IDs from localStorage
    const shownBadgeIds = getShownBadgeIds();
    
    // Find the newest badge that hasn't been shown yet
    const newBadges = badges
      .filter(badge => !shownBadgeIds.includes(badge.id))
      .sort((a, b) => {
        // Sort by newest earned first
        return new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime();
      });
    
    // If we found a new badge, show notification
    if (newBadges.length > 0) {
      const newestBadge = newBadges[0];
      setNotificationState({
        showNotification: true,
        currentBadge: newestBadge
      });
      
      // Add this badge to the shown badges list
      markBadgeAsShown(newestBadge.id);
    }
  }, [badges]);
  
  // Handle closing the notification
  const closeNotification = () => {
    setNotificationState({
      showNotification: false,
      currentBadge: null
    });
  };
  
  // Helper to get previously shown badge IDs
  const getShownBadgeIds = (): string[] => {
    try {
      const stored = localStorage.getItem(SHOWN_BADGES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error getting shown badges from localStorage:", error);
      return [];
    }
  };
  
  // Helper to mark a badge as shown
  const markBadgeAsShown = (badgeId: string) => {
    try {
      const shownBadgeIds = getShownBadgeIds();
      if (!shownBadgeIds.includes(badgeId)) {
        shownBadgeIds.push(badgeId);
        localStorage.setItem(SHOWN_BADGES_KEY, JSON.stringify(shownBadgeIds));
      }
    } catch (error) {
      console.error("Error saving shown badges to localStorage:", error);
    }
  };
  
  return {
    showNotification: notificationState.showNotification,
    currentBadge: notificationState.currentBadge,
    closeNotification,
    markBadgeAsShown
  };
};
