import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, Music, BookOpen, MessagesSquare, Heart, Calendar, 
  ShoppingBag, Settings, Users, Shield, FileEdit, User, LogOut
} from "lucide-react";
import MusicLogo from "./MusicLogo";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, profile, signOut } = useAuth();
  
  // Define basic permissions for standard users
  const defaultPermissions = ["access_dashboard", "access_practice", "access_courses", "access_community", "access_wellness"];
  
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
    { name: "Manage Wellness", path: "/wellness/manage", icon: <Heart className="h-5 w-5" />, permission: "manage_courses" },
  ];
  
  const settingsLink = { name: "Settings", path: "/settings", icon: <Settings className="h-5 w-5" />, permission: "access_dashboard" };

  // Enhanced hasPermission check that also considers default permissions for all users
  const checkPermission = (permission: string): boolean => {
    if (defaultPermissions.includes(permission)) {
      return true; // Grant access to default permissions for all authenticated users
    }
    return hasPermission(permission);
  };

  // Filter links based on enhanced permission check
  const filteredCommonLinks = commonLinks.filter(link => checkPermission(link.permission));
  const filteredAdminLinks = adminLinks.filter(link => checkPermission(link.permission));
  const filteredTeamLinks = teamLinks.filter(link => checkPermission(link.permission));
  
  // Function to get user's display name
  const getDisplayName = () => {
    if (profile?.first_name) {
      return profile.first_name;
    } else if (profile?.username) {
      return profile.username;
    }
    return 'User';
  };
  
  // Function to get user's initials
  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return profile.first_name.charAt(0).toUpperCase();
    } else if (profile?.username) {
      return profile.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-card/30 backdrop-blur-md border-r border-white/10 p-4 flex flex-col">
      <div className="py-4 px-2 mb-8">
        <MusicLogo withText />
      </div>
      
      <nav className="flex-1 space-y-1.5">
        {/* Common Links */}
        {filteredCommonLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-link ${location.pathname === link.path ? "active" : ""}`}
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        ))}
        
        {/* Admin Links (if user has admin permissions) */}
        {filteredAdminLinks.length > 0 && (
          <>
            <div className="pt-4 my-2 border-t border-white/10">
              <p className="px-3 text-xs font-medium text-white/40 uppercase tracking-wider">
                Administration
              </p>
            </div>
            {filteredAdminLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`sidebar-link ${location.pathname === link.path ? "active" : ""}`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </>
        )}
        
        {/* Team Links (if user has team permissions) */}
        {filteredTeamLinks.length > 0 && (
          <>
            <div className="pt-4 my-2 border-t border-white/10">
              <p className="px-3 text-xs font-medium text-white/40 uppercase tracking-wider">
                Content Management
              </p>
            </div>
            {filteredTeamLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`sidebar-link ${
                  location.pathname === link.path ||
                  (link.path === "/courses/manage" && location.pathname.startsWith("/courses/manage")) ||
                  (link.path === "/wellness/manage" && location.pathname.startsWith("/wellness/manage"))
                    ? "active"
                    : ""
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </>
        )}
        
        {/* Settings is always available */}
        <div className="pt-4 my-2 border-t border-white/10">
          <Link
            to={settingsLink.path}
            className={`sidebar-link ${location.pathname === settingsLink.path ? "active" : ""}`}
          >
            {settingsLink.icon}
            <span>{settingsLink.name}</span>
          </Link>
        </div>
      </nav>
      
      <div className="mt-auto pt-4 border-t border-white/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="sidebar-link w-full hover:bg-white/5 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-music-primary/20 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={`${getDisplayName()}'s avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, show the initials fallback
                      const target = e.target as HTMLImageElement;
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-sm font-medium text-music-primary">${getUserInitials()}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className="text-sm font-medium text-music-primary">
                    {getUserInitials()}
                  </span>
                )}
              </div>
              <span>{getDisplayName()}</span>
              <span className="ml-auto text-xs px-2 py-1 rounded bg-white/10 text-white/70">
                {profile?.role || 'user'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-card/95 backdrop-blur-md border-white/10 text-white">
            <DropdownMenuItem 
              className="flex items-center cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center cursor-pointer"
              onClick={() => navigate('/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              className="flex items-center cursor-pointer text-red-400"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};

export default Sidebar;
