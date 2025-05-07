
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicLogo from "@/components/MusicLogo";
import { useAuth } from "@/context/AuthContext";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const { toast } = useToast();
  const { signIn, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Demo account credentials
  const DEMO_EMAIL = "demo@beingofmusic.com";
  const DEMO_PASSWORD = "demo123456";

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in to Being of Music.",
      });
      
      navigate("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setIsDemoLoading(true);

    try {
      const { error } = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
      
      if (error) {
        console.error("Demo sign in error:", error);
        setError("Demo account access failed. Please try again or contact support.");
        return;
      }
      
      toast({
        title: "Demo Mode Active",
        description: "You're now exploring Being of Music as a demo user.",
      });
      
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to access demo account. Please try again later.");
      console.error("Demo sign in error:", err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
      console.error("Google sign in error:", err);
    }
  };

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
          
          {error && (
            <Alert className="mb-4 border-red-500/50 bg-red-500/10 text-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form className="space-y-4" onSubmit={handleSignIn}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="bg-background/50 border-white/20"
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-background/50 border-white/20"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full music-button py-5" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <Button
            type="button"
            variant="secondary"
            className="w-full mt-4 bg-music-secondary/70 hover:bg-music-secondary text-white"
            onClick={handleDemoSignIn}
            disabled={isDemoLoading}
          >
            {isDemoLoading ? "Accessing Demo..." : "Try Demo Account"}
          </Button>
          
          <div className="relative flex items-center mt-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-white/50 text-sm">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full mt-6 bg-background/50 hover:bg-background/70" 
            onClick={handleGoogleSignIn}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
          
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
