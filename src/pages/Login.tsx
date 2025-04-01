
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginHeader from '@/components/LoginHeader';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import Footer from '@/components/Footer';
import ErrorBanner from '@/components/ErrorBanner';
import { getBackendURL } from '@/utils/config';
import { useToast } from '@/hooks/use-toast';
import { isAuthenticated } from '@/utils/authUtils';

const Login = () => {
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      // Redirect to dashboard if already logged in
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleGitHubLogin = async () => {
    try {
      // Check if the backend is reachable first
      const testResponse = await fetch(`${getBackendURL()}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
      }).catch(() => null);

      if (!testResponse) {
        setIsError(true);
        toast({
          title: "Connection Error",
          description: "Unable to connect to authentication service. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      // Redirect the user to the backend's /github/login endpoint
      window.location.href = `${getBackendURL()}/github/login`;
    } catch (error) {
      console.error("Error initiating GitHub login:", error);
      setIsError(true);
      toast({
        title: "Authentication Error",
        description: "Failed to initiate GitHub login. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div 
        className="absolute inset-0 bg-cover bg-center blur-[80px] opacity-20 z-0"
        style={{ 
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(100, 116, 255, 0.4), rgba(100, 116, 255, 0.05))" 
        }}
      />
      
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {isError && (
            <ErrorBanner 
              message="We're having trouble connecting to our authentication service. Please try again later."
              onDismiss={() => setIsError(false)}
            />
          )}
          
          <GlassMorphicCard className="w-full mx-auto">
            <div className="py-8 px-4 sm:px-6">
              <LoginHeader />
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8"
              >
                <button
                  onClick={handleGitHubLogin}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                  disabled={isError}
                >
                  <Github className="w-5 h-5 mr-2" />
                  Sign in with GitHub
                </button>
                
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  By signing in, you agree to our{' '}
                  <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
                    Privacy Policy
                  </a>
                </p>
              </motion.div>
            </div>
          </GlassMorphicCard>
        </div>
      </main>
      
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Login;
