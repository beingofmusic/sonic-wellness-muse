
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface SidebarNavLinkProps {
  name: string;
  path: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({ name, path, icon, isActive }) => {
  const location = useLocation();
  
  // If isActive is not provided, determine it based on the current location
  const active = isActive !== undefined 
    ? isActive 
    : location.pathname === path || 
      (path !== "/dashboard" && location.pathname.startsWith(path));

  return (
    <Link
      to={path}
      className={`sidebar-link ${active ? "active" : ""}`}
    >
      {icon}
      <span>{name}</span>
    </Link>
  );
};

export default SidebarNavLink;
