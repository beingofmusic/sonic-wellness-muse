
import React from "react";
import SidebarNavLink from "./SidebarNavLink";

interface NavLink {
  name: string;
  path: string;
  icon: React.ReactNode;
  permission: string;
}

interface SidebarNavSectionProps {
  title?: string;
  links: NavLink[];
  checkPermission: (permission: string) => boolean;
}

const SidebarNavSection: React.FC<SidebarNavSectionProps> = ({ 
  title, 
  links,
  checkPermission 
}) => {
  // Filter links based on permissions
  const filteredLinks = links.filter(link => checkPermission(link.permission));
  
  if (filteredLinks.length === 0) {
    return null;
  }

  return (
    <>
      {title && (
        <div className="pt-4 my-2 border-t border-white/10">
          <p className="px-3 text-xs font-medium text-white/40 uppercase tracking-wider">
            {title}
          </p>
        </div>
      )}
      {filteredLinks.map((link) => (
        <SidebarNavLink 
          key={link.path} 
          name={link.name} 
          path={link.path} 
          icon={link.icon} 
        />
      ))}
    </>
  );
};

export default SidebarNavSection;
