
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SidebarUserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  
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
    <div className="mt-auto pt-4 border-t border-white/10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="sidebar-link w-full hover:bg-white/5 transition-colors">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-music-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-music-primary">
                {getUserInitials()}
              </span>
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
  );
};

export default SidebarUserProfile;
