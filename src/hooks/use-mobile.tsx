
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Check if window is defined (browser environment)
    if (typeof window === "undefined") {
      return;
    }
    
    // Create the check function
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Call it immediately
    checkMobile();
    
    // Set up the event listener
    window.addEventListener("resize", checkMobile);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Return the state
  return isMobile;
}
