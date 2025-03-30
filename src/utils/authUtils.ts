
import Cookies from 'js-cookie';

// Get the API base URL from environment variables
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:8080';
};

// Get the stored access token
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Set the access token in localStorage
export const setAccessToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

// Validate the access token with the backend
export const validateAccessToken = async (): Promise<boolean> => {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    return false;
  }
  
  try {
    const response = await fetch(`${getApiUrl()}/api/user-auth-token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error validating access token:', error);
    return false;
  }
};

// Refresh the tokens using the refresh token cookie
export const refreshTokens = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${getApiUrl()}/api/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    
    // Store the new access token
    setAccessToken(data.access_token);
    
    return true;
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    return false;
  }
};
