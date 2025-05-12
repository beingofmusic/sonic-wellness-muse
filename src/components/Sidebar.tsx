
import React from "react";
import MusicLogo from "./MusicLogo";
import { useAuth } from "@/context/AuthContext";
import SidebarNav from "./sidebar/SidebarNav";
import SidebarUserProfile from "./sidebar/SidebarUserProfile";

const Sidebar: React.FC = () => {
  const { hasPermission } = useAuth();
  
  // Define basic permissions for standard users
  const defaultPermissions = ["access_dashboard", "access_practice", "access_courses", "access_community", "access_wellness"];
  
  // Enhanced hasPermission check that also considers default permissions for all users
  const checkPermission = (permission: string): boolean => {
    if (defaultPermissions.includes(permission)) {
      return true; // Grant access to default permissions for all authenticated users
    }
    return hasPermission(permission);
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-card/30 backdrop-blur-md border-r border-white/10 p-4 flex flex-col">
      <div className="py-4 px-2 mb-8">
        <MusicLogo withText />
      </div>
      
      <SidebarNav checkPermission={checkPermission} />
      
      <SidebarUserProfile />
    </aside>
  );
};

export default Sidebar;
