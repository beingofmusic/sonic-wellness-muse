
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MusicLogo from "./MusicLogo";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  isAuthenticated?: boolean;
}

const Navbar: React.FC<NavbarProps> = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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
              <Link to="/dashboard">
                <Button className="music-button">Dashboard</Button>
              </Link>
              <Button variant="ghost" className="text-white/80 hover:text-white" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
