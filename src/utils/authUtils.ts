
import Cookies from 'js-cookie';
import { getBackendURL, createApiHeaders, fetchApi } from './config';

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
    const response = await fetchApi('api/user-auth-token', {
      method: 'GET',
    }, accessToken);
    
    return response.ok;
  } catch (error) {
    console.error('Error validating access token:', error);
    return false;
  }
};

// Refresh the tokens using the refresh token cookie
export const refreshTokens = async (): Promise<boolean> => {
  try {
    const response = await fetchApi('api/refresh-token', {
      method: 'POST',
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

// Handle redirection to dashboard after authentication
export const redirectToDashboard = (): void => {
  window.location.href = '/dashboard';
};

// Log out the user by clearing tokens
export const logoutUser = (): void => {
  localStorage.removeItem('access_token');
  // Note: refresh_token is an HttpOnly cookie that can't be removed from client-side
  // The backend should handle invalidating it
  window.location.href = '/';
};
