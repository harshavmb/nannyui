import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const withAuth = (WrappedComponent: React.ComponentType) => {
  const AuthWrapper = (props: any) => {
    const navigate = useNavigate();

    useEffect(() => {
      const checkAuth = async () => {
        const accessToken = localStorage.getItem('access_token');

        if (!accessToken) {
          // Redirect to GitHub login if no access token is found
          navigate('/');
          return;
        }

        try {
          // Validate the access token with the backend
          const response = await fetch('http://localhost:8080/api/user-auth-token', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            credentials: 'include',
          });

          if (response.status === 401) {
            // If access token is invalid, try refreshing the tokens
            const refreshResponse = await fetch('http://localhost:8080/api/refresh-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });

            if (!refreshResponse.ok) {
              // Handle first-time login scenario
              if (refreshResponse.status === 400) {
                console.warn('First-time login detected. Redirecting to GitHub login...');
                return; // Allow the user to proceed without redirecting
              }
              throw new Error('Failed to refresh tokens');
            }

            const data = await refreshResponse.json();

            // Set the new access_token in localStorage
            localStorage.setItem('access_token', data.access_token);

            // Set the new refresh_token as a cookie
            Cookies.set('refresh_token', data.refresh_token, {
              expires: 7,
              path: '/',
              SameSite: 'None',
              secure: true,
            });
          } else if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.error('Authentication error:', error);

          // Redirect to GitHub login if refresh token is expired
          navigate('/');
        }
      };

      checkAuth();
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };

  return AuthWrapper;
};

export default withAuth;