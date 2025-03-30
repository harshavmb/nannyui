
import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface ErrorBannerProps {
  message?: string;
  onDismiss?: () => void;
}

const ErrorBanner = ({ 
  message = "We're experiencing issues connecting to our servers. Please try again later.", 
  onDismiss 
}: ErrorBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="w-full bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6 flex items-center justify-between">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button 
        onClick={handleDismiss}
        className="p-1 rounded-full hover:bg-destructive/20 transition-colors"
      >
        <XCircle className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ErrorBanner;
