import React from "react";
import {
  LayoutDashboard,
  Music,
  Flame,
  Users,
  ShoppingBag,
  Settings,
  BookText
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive: boolean;
}> = ({ icon, label, to, isActive }) => (
  <NavLink
    to={to}
    className={`relative flex flex-col items-center justify-center h-full text-sm transition-colors group ${
      isActive
        ? "text-music-primary"
        : "text-white/50 hover:text-white/80"
    }`}
  >
    {icon}
    <span className="absolute bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity">{label}</span>
    {isActive && (
      <span className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-1 bg-music-primary rounded-full"></span>
    )}
  </NavLink>
);

const SheetNavigation: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const displayName = profile?.first_name || user?.email || "User";
  const email = user?.email || "No Email";

  const getInitials = () => {
    if (profile?.first_name) {
      return profile.first_name.charAt(0).toUpperCase() + (profile.last_name ? profile.last_name.charAt(0).toUpperCase() : '');
    }
    return "U";
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="h-full w-full text-white/50 hover:text-white/80">
          <Users size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-background border-t border-white/10">
        <SheetHeader className="text-left">
          <SheetTitle>Account</SheetTitle>
          <SheetDescription>
            Manage your account settings and set preferences.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Avatar>
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile?.first_name || 'User'} />
              ) : (
                <AvatarFallback className="bg-music-primary/20 text-music-primary">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-white/50 truncate max-w-[10rem]">
                {email}
              </p>
            </div>
          </div>
          <NavItem
            icon={<Settings size={18} />}
            label="Settings"
            to="/settings"
            isActive={location.pathname === "/settings"}
          />
          <Button variant="destructive" onClick={() => signOut()}>Sign Out</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const MobileNavbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full h-16 bg-background border-t border-white/10 md:hidden">
      <div className="grid h-full grid-cols-5">
        <NavItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          to="/dashboard"
          isActive={location.pathname === "/dashboard"}
        />
        <NavItem
          icon={<Music size={20} />}
          label="Practice"
          to="/practice"
          isActive={location.pathname.startsWith("/practice")}
        />
        <NavItem
          icon={<Flame size={20} />}
          label="Wellness"
          to="/wellness"
          isActive={location.pathname.startsWith("/wellness")}
        />
        <NavItem
          icon={<BookText size={20} />}
          label="Journal"
          to="/journal"
          isActive={location.pathname.startsWith("/journal")}
        />
        <SheetNavigation />
      </div>
    </nav>
  );
};

export default MobileNavbar;
