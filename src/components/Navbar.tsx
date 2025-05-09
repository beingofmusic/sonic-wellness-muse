
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MusicLogo from "./MusicLogo";
import { useAuth } from "@/context/AuthContext";
import { Shield, User, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  isAuthenticated?: boolean;
}

const Navbar: React.FC<NavbarProps> = () => {
  const { user, profile, signOut, isAdmin, isTeamMember } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Function to get the role icon
  const getRoleIcon = () => {
    if (isAdmin) {
      return <Shield className="h-4 w-4 mr-2 text-red-400" />;
    } else if (isTeamMember) {
      return <Users className="h-4 w-4 mr-2 text-blue-400" />;
    } else {
      return <User className="h-4 w-4 mr-2 text-green-400" />;
    }
  };
  
  // Function to get user display name
  const getDisplayName = () => {
    if (profile?.first_name) {
      return profile.first_name;
    } else if (profile?.username) {
      return profile.username;
    }
    return 'User';
  };
  
  // Function to get user initials for avatar
  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`;
    } else if (profile?.first_name) {
      return profile.first_name.charAt(0);
    } else if (profile?.username) {
      return profile.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="border-b border-white/10 backdrop-blur-md bg-background/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <MusicLogo withText />
        </Link>
        
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link to="/signin">
                <Button variant="ghost" className="text-white/80 hover:text-white">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button className="music-button px-4 py-2">Join Now</Button>
              </Link>
            </>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white/80 hover:text-white">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-music-primary/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-music-primary">
                        {getUserInitials()}
                      </span>
                    </div>
                    <span className="hidden md:inline">{getDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-md border-white/10 text-white">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>My Account</span>
                    <Badge 
                      variant="outline" 
                      className="ml-2 bg-white/5"
                    >
                      <span className="flex items-center">
                        {getRoleIcon()}
                        {profile?.role || 'user'}
                      </span>
                    </Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />

                  {/* Profile link - added this new item */}
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>

                  {/* Dashboard link */}
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </DropdownMenuItem>

                  {/* Admin-specific links */}
                  {isAdmin && (
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/admin')}>
                      Admin Panel
                    </DropdownMenuItem>
                  )}

                  {/* Team-specific links */}
                  {isTeamMember && (
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/team')}>
                      Team Dashboard
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
                    Settings
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="cursor-pointer text-red-400" onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
