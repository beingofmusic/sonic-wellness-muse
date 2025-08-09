
import React, { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNavbar from "@/components/MobileNavbar";
import MobileTopBar from "@/components/MobileTopBar";
import { useIsMobile } from "@/hooks/use-mobile";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen">
      {isMobile === false && <Sidebar />}
      
      {isMobile === true && <MobileTopBar />}
      
      <main className={`flex-1 p-4 md:p-6 pb-20 md:pb-6 w-full ${isMobile ? "mt-16" : ""}`}>
        {children}
      </main>
      
      {isMobile === true && <MobileNavbar />}
      <OnboardingWizard />
    </div>
  );
};
