
import React, { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNavbar from "@/components/MobileNavbar";
import MobileTopBar from "@/components/MobileTopBar";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Use the hook safely
  const isMobile = useIsMobile();

  // Only render sidebar when we're sure we're not on mobile
  const showSidebar = isMobile === false;
  
  return (
    <div className="flex min-h-screen">
      {/* Show sidebar only on desktop */}
      {showSidebar && <Sidebar />}
      
      {/* Mobile top bar */}
      <MobileTopBar />
      
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 w-full mt-16 md:mt-0">
        {children}
      </main>
      
      {/* Mobile navigation */}
      <MobileNavbar />
    </div>
  );
};
