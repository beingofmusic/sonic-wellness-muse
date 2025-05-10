
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MusicLogo from "@/components/MusicLogo";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

const MobileTopBar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (profile?.first_name) {
      const firstInitial = profile.first_name.charAt(0);
      const lastInitial = profile.last_name ? profile.last_name.charAt(0) : '';
      return `${firstInitial}${lastInitial}`;
    }
    if (profile?.username) return profile.username.charAt(0).toUpperCase();
    return "U";
  };
  
  // Handle navigation
  const handleNavigate = (path: string) => {
    navigate(path);
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  
  // Only show top bar when isMobile is true
  // If it's null (initial state), we don't render yet
  if (isMobile !== true) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-card/90 backdrop-blur-lg md:hidden z-50">
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center">
          <MusicLogo size="sm" />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8">
                {profile?.avatar_url ? (
                  <AvatarImage 
                    src={profile.avatar_url} 
                    alt="User avatar" 
                    className="object-cover" 
                  />
                ) : (
                  <AvatarFallback className="bg-music-primary/20 text-music-primary">
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 bg-card/95 backdrop-blur-md border-white/10"
          >
            <DropdownMenuItem 
              onClick={() => handleNavigate("/profile")}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleNavigate("/settings")}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MobileTopBar;
