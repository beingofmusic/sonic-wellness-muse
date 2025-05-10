
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, Music, Calendar, Heart, MessagesSquare, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MobileNavbar: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const navItems = [
    { label: "Home", icon: <Home size={20} />, path: "/dashboard" },
    { label: "Practice", icon: <Music size={20} />, path: "/practice" },
    { label: "Calendar", icon: <Calendar size={20} />, path: "/calendar" },
    { label: "Wellness", icon: <Heart size={20} />, path: "/wellness" },
    { label: "Community", icon: <MessagesSquare size={20} />, path: "/community" },
  ];
  
  const moreItems = [
    { label: "Courses", path: "/courses" },
    { label: "Shop", path: "/shop" },
    { label: "Settings", path: "/settings" },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Only show navbar when isMobile is true
  // If it's null (initial state), we don't render yet
  if (isMobile !== true) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-card/90 backdrop-blur-lg md:hidden z-50">
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center text-xs gap-1 ${
              isActive(item.path)
                ? "text-music-primary"
                : "text-white/70 hover:text-white"
            }`}
          >
            <span className={isActive(item.path) ? "text-music-primary" : "text-white/70"}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost"
              className="flex flex-col items-center justify-center text-xs gap-1 h-full w-full rounded-none bg-transparent hover:bg-white/5 text-white/70 hover:text-white"
            >
              <MoreHorizontal size={20} />
              <span>More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-card/95 backdrop-blur-md border-white/10 w-40"
          >
            {moreItems.map((item) => (
              <DropdownMenuItem key={item.path} asChild>
                <Link 
                  to={item.path}
                  className={isActive(item.path) ? "text-music-primary" : ""}
                >
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MobileNavbar;
