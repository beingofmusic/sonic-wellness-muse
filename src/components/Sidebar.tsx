
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Music, BookOpen, MessagesSquare, Heart, Calendar, ShoppingBag, Settings } from "lucide-react";
import MusicLogo from "./MusicLogo";

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const links = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Practice", path: "/practice", icon: <Music className="h-5 w-5" /> },
    { name: "Courses", path: "/courses", icon: <BookOpen className="h-5 w-5" /> },
    { name: "Community", path: "/community", icon: <MessagesSquare className="h-5 w-5" /> },
    { name: "Wellness", path: "/wellness", icon: <Heart className="h-5 w-5" /> },
    { name: "Calendar", path: "/calendar", icon: <Calendar className="h-5 w-5" /> },
    { name: "Shop", path: "/shop", icon: <ShoppingBag className="h-5 w-5" /> },
    { name: "Settings", path: "/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 bg-card/30 backdrop-blur-md border-r border-white/10 p-4 flex flex-col">
      <div className="py-4 px-2 mb-8">
        <MusicLogo withText />
      </div>
      
      <nav className="flex-1 space-y-1.5">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-link ${location.pathname === link.path ? "active" : ""}`}
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="sidebar-link">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-music-primary/20 flex items-center justify-center">
            <span className="text-sm font-medium text-music-primary">DU</span>
          </div>
          <span>Demo User</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
