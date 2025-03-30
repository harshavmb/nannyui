
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the user has already accepted cookies
    const hasAcceptedCookies = localStorage.getItem('cookiesAccepted');
    
    if (!hasAcceptedCookies) {
      // Show the banner if the user hasn't accepted cookies yet
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    // Save the acceptance to localStorage
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
    toast({
      title: "Cookies accepted",
      description: "Your preferences have been saved",
    });
  };

  const declineCookies = () => {
    // Save the declination to localStorage to remember the choice
    localStorage.setItem('cookiesAccepted', 'false');
    setIsVisible(false);
    toast({
      title: "Cookies declined",
      description: "Only essential cookies will be used",
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg animate-fade-up">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-1">Cookie Consent</h3>
            <p className="text-sm text-muted-foreground mb-2">
              We use cookies to enhance your browsing experience and analyze our traffic. 
              We only collect your IP address and GitHub profile information (when you sign in) 
              to provide our services and for security purposes.
            </p>
            <p className="text-sm text-muted-foreground">
              Read our <Link to="/cookies" className="text-primary underline hover:text-primary/80">Cookie Policy</Link> for more details.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 self-end lg:self-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={declineCookies}
              className="whitespace-nowrap"
            >
              Decline
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={acceptCookies}
              className="whitespace-nowrap"
            >
              Accept All Cookies
            </Button>
            <button 
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 rounded-full"
              onClick={() => setIsVisible(false)}
              aria-label="Close cookie banner temporarily"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
