import React, { createContext, useContext, useEffect, useState } from 'react';
import { pb } from '@/integrations/pocketbase/client';
import type { UserRecord } from '@/integrations/pocketbase/types';

export interface AuthContextType {
  user: UserRecord | null;
  token: string | null;
  loading: boolean;
  signOut?: () => Promise<void>;
  signIn?: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRecord | null>(() => {
    return pb.authStore.isValid ? (pb.authStore.record as unknown as UserRecord) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return pb.authStore.isValid ? pb.authStore.token : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 0);

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(record as unknown as UserRecord | null);
      setToken(_token || null);
    }) as unknown as (() => void) | undefined;

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const value = {
    user,
    token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
