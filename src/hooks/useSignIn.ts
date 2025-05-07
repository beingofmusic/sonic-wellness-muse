
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useSignIn = () => {
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    isLoading,
    isDemoLoading,
    handleSignIn,
    handleDemoSignIn,
    handleGoogleSignIn
  };
};
