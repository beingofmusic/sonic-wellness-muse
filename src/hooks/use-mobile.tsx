
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Initial check
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    // Create event listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}
