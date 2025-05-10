import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MusicLogo } from "@/components/MusicLogo";
import {
  LayoutDashboard,
  Music,
  GraduationCap,
  Users,
  CalendarDays,
  ShoppingBag,
  Flame,
  LineChart,
  ShieldAlert,
  BookText
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "bg-music-primary/20 text-white"
          : "text-white/70 hover:text-white hover:bg-white/10"
      )}
    >
      <span className="mr-3 text-white/80">{icon}</span>
      {label}
    </Link>
  );
};

const Sidebar = () => {
  const { user, profile, permissions } = useAuth();
  const email = user?.email || "";

  const getInitials = () => {
    if (profile?.first_name) {
      const firstInitial = profile.first_name.charAt(0).toUpperCase();
      const lastInitial = profile.last_name ? profile.last_name.charAt(0).toUpperCase() : '';
      return `${firstInitial}${lastInitial}`;
    }
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`
    : email.split("@")[0];

  return (
    <aside className="fixed top-0 left-0 z-30 h-full w-64 hidden md:block bg-background shadow-xl border-r border-white/10">
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex items-center justify-center h-16 border-b border-white/10">
          <MusicLogo className="h-8 w-auto" />
        </div>

        <div className="flex-1 py-4 px-3 space-y-1">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" to="/dashboard" />
          <SidebarItem icon={<Music size={18} />} label="Practice" to="/practice" />
          <SidebarItem icon={<GraduationCap size={18} />} label="Courses" to="/courses" />
          <SidebarItem icon={<Users size={18} />} label="Community" to="/community" />
          <SidebarItem icon={<CalendarDays size={18} />} label="Calendar" to="/calendar" />
          <SidebarItem icon={<ShoppingBag size={18} />} label="Shop" to="/shop" />
          <SidebarItem icon={<Flame size={18} />} label="Wellness" to="/wellness" />
          
          {/* Add new link to the Journal feature */}
          <SidebarItem icon={<BookText size={18} />} label="Journal" to="/journal" />
          
          {permissions.includes('team') && (
            <SidebarItem icon={<LineChart size={18} />} label="Team Dashboard" to="/team" />
          )}
          
          {permissions.includes('admin') && (
            <SidebarItem icon={<ShieldAlert size={18} />} label="Admin Panel" to="/admin" />
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile?.first_name || 'User'} />
              ) : (
                <AvatarFallback className="bg-music-primary/20 text-music-primary">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-white/50 truncate max-w-[10rem]">
                {email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
