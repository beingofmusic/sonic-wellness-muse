
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormHeader from "@/components/auth/FormHeader";
import EmailForm from "@/components/auth/EmailForm";
import SocialLogin from "@/components/auth/SocialLogin";
import { useSignIn } from "@/hooks/useSignIn";
import { useAuth } from "@/context/AuthContext";

const SignIn: React.FC = () => {
  const { 
    email, 
    setEmail, 
    password, 
    setPassword,
    error, 
    isLoading, 
    isDemoLoading,
    handleSignIn,
    handleDemoSignIn,
    handleGoogleSignIn
  } = useSignIn();
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md p-8 rounded-xl bg-card/80 backdrop-blur-sm border border-white/10 shadow-xl">
          <FormHeader />
          
          {error && (
            <Alert className="mb-4 border-red-500/50 bg-red-500/10 text-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <EmailForm 
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
            onSubmit={handleSignIn}
          />
          
          <SocialLogin
            isDemoLoading={isDemoLoading}
            onDemoClick={handleDemoSignIn}
            onGoogleClick={handleGoogleSignIn}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignIn;
