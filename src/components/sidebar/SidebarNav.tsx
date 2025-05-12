
import React from "react";
import { 
  Home, Music, BookOpen, MessagesSquare, Heart, Calendar, 
  ShoppingBag, Settings, Shield, FileEdit 
} from "lucide-react";
import SidebarNavSection from "./SidebarNavSection";

interface SidebarNavProps {
  checkPermission: (permission: string) => boolean;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ checkPermission }) => {
  const commonLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5" />, permission: "access_dashboard" },
    { name: "Practice", path: "/practice", icon: <Music className="h-5 w-5" />, permission: "access_practice" },
    { name: "Courses", path: "/courses", icon: <BookOpen className="h-5 w-5" />, permission: "access_courses" },
    { name: "Community", path: "/community", icon: <MessagesSquare className="h-5 w-5" />, permission: "access_community" },
    { name: "Wellness", path: "/wellness", icon: <Heart className="h-5 w-5" />, permission: "access_wellness" },
    { name: "Calendar", path: "/calendar", icon: <Calendar className="h-5 w-5" />, permission: "access_dashboard" },
    { name: "Merch", path: "/shop", icon: <ShoppingBag className="h-5 w-5" />, permission: "access_dashboard" },
  ];
  
  const adminLinks = [
    { name: "Admin Panel", path: "/admin", icon: <Shield className="h-5 w-5" />, permission: "manage_users" },
  ];
  
  const teamLinks = [
    { name: "Team Dashboard", path: "/team", icon: <FileEdit className="h-5 w-5" />, permission: "contribute_content" },
    { name: "Manage Courses", path: "/courses/manage", icon: <BookOpen className="h-5 w-5" />, permission: "manage_courses" },
  ];

  const settingsLink = { name: "Settings", path: "/settings", icon: <Settings className="h-5 w-5" />, permission: "access_dashboard" };

  return (
    <nav className="flex-1 space-y-1.5">
      {/* Common Links */}
      <SidebarNavSection links={commonLinks} checkPermission={checkPermission} />
      
      {/* Admin Links */}
      <SidebarNavSection 
        title="Administration" 
        links={adminLinks} 
        checkPermission={checkPermission} 
      />
      
      {/* Team Links */}
      <SidebarNavSection 
        title="Content Management" 
        links={teamLinks} 
        checkPermission={checkPermission} 
      />
      
      {/* Settings Link (always available) */}
      <div className="pt-4 my-2 border-t border-white/10">
        <SidebarNavSection links={[settingsLink]} checkPermission={checkPermission} />
      </div>
    </nav>
  );
};

export default SidebarNav;
