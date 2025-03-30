
import React from 'react';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';
import LoginHeader from '@/components/LoginHeader';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import Footer from '@/components/Footer';
import { getBackendURL } from '@/utils/config';

const Index = () => {
  const handleGitHubLogin = async () => {
    try {
      // Redirect the user to the backend's /github/login endpoint
      window.location.href = `${getBackendURL()}/github/login`;
    } catch (error) {
      console.error("Error initiating GitHub login:", error);
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
        <GlassMorphicCard className="max-w-md w-full mx-auto">
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
      </main>
      
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
