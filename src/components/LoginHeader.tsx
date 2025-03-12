
import React from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

const LoginHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center mb-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slight"></div>
        <div className="relative bg-primary text-white p-4 rounded-full">
          <Terminal className="w-8 h-8" />
        </div>
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-6 text-3xl font-bold tracking-tight"
      >
        Linux Agents API
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-2 text-muted-foreground text-center max-w-sm"
      >
        Secure access to advanced API services for Linux agents
      </motion.p>
    </div>
  );
};

export default LoginHeader;
