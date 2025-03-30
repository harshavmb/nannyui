
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateAccessToken, refreshTokens, getAccessToken } from './authUtils';
import { useToast } from '@/components/ui/use-toast';

// Higher-order component for authentication
const withAuth = (WrappedComponent: React.ComponentType) => {
  const AuthWrapper = (props: any) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    
    useEffect(() => {
      // Skip auth check if already on the login page
      if (location.pathname === '/') {
        setIsAuthenticated(false);
        return;
      }
      
      let isMounted = true;
      
      const checkAuth = async () => {
        // Check if we have an access token
        const accessToken = getAccessToken();
        
        if (!accessToken) {
          // No access token, try to refresh
          const refreshSuccessful = await refreshTokens();
          
          if (!refreshSuccessful && isMounted) {
            // Both checks failed, redirect to login
            console.log('Authentication failed, redirecting to login');
            setIsAuthenticated(false);
            navigate('/', { replace: true });
            return;
          }
        } else {
          // Validate existing access token
          const isValid = await validateAccessToken();
          
          if (!isValid) {
            // Access token invalid, try refresh
            const refreshSuccessful = await refreshTokens();
            
            if (!refreshSuccessful && isMounted) {
              // Refresh failed too, redirect to login
              console.log('Token validation and refresh failed, redirecting to login');
              setIsAuthenticated(false);
              navigate('/', { replace: true });
              return;
            }
          }
        }
        
        // If we got here, authentication is successful
        if (isMounted) {
          setIsAuthenticated(true);
        }
      };
      
      checkAuth();
      
      return () => {
        isMounted = false;
      };
    }, [navigate, location.pathname]);
    
    // Show loading while checking authentication
    if (isAuthenticated === null && location.pathname !== '/') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    // Render the wrapped component if authenticated or on login page
    return <WrappedComponent {...props} />;
  };
  
  return AuthWrapper;
};

export default withAuth;
