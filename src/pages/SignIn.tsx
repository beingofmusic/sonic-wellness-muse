
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicLogo from "@/components/MusicLogo";

const SignIn: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md p-8 rounded-xl bg-card/80 backdrop-blur-sm border border-white/10 shadow-xl">
          <div className="flex flex-col items-center mb-6">
            <MusicLogo size="lg" withText />
            <h1 className="text-2xl font-semibold mt-4">Welcome Back</h1>
            <p className="text-white/70 text-sm">Sign in to continue your musical journey</p>
          </div>
          
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                className="bg-background/50 border-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-music-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-background/50 border-white/20"
              />
            </div>
            
            <Button type="submit" className="w-full music-button py-5">
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-music-primary hover:underline">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignIn;
