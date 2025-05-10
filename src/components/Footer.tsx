
import React from "react";
import { Link } from "react-router-dom";
import MusicLogo from "./MusicLogo";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <MusicLogo withText />
            <p className="mt-4 text-white/70 text-sm">
              A holistic platform for music students to practice effectively,
              nurture wellbeing, and connect with a community of passionate musicians.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Features</h3>
            <ul className="space-y-2 text-white/70">
              <li><Link to="/practice" className="hover:text-music-primary transition-colors">Practice Builder</Link></li>
              <li><Link to="/courses" className="hover:text-music-primary transition-colors">Courses</Link></li>
              <li><Link to="/wellness" className="hover:text-music-primary transition-colors">Wellness Hub</Link></li>
              <li><Link to="/community" className="hover:text-music-primary transition-colors">M.U.S.E. Community</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Company</h3>
            <ul className="space-y-2 text-white/70">
              <li><Link to="/about" className="hover:text-music-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-music-primary transition-colors">Contact</Link></li>
              <li><Link to="/pricing" className="hover:text-music-primary transition-colors">Pricing</Link></li>
              <li><Link to="/faq" className="hover:text-music-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Legal</h3>
            <ul className="space-y-2 text-white/70">
              <li><Link to="/terms" className="hover:text-music-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-music-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="hover:text-music-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50 text-sm">
          <p>© {new Date().getFullYear()} Being of Music. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
