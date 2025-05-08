
import React, { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNavbar from "@/components/MobileNavbar";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Use the hook safely
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen">
      {/* Show sidebar only on desktop */}
      {!isMobile && <Sidebar />}
      
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 w-full">
        {children}
      </main>
      
      {/* Mobile navigation */}
      <MobileNavbar />
    </div>
  );
};
