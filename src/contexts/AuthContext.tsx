import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { jwtVerify } from 'jose';
import { authService } from '../services/auth';
import { env } from '../config';
import type { AuthContextType, User } from '../types/auth';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string, mfaCode?: string) => {
    try {
      const result = await authService.login({ email, password, mfaCode });
      
      if (result.requiresMfa) {
        return { requiresMfa: true };
      }

      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    const deviceId = localStorage.getItem('deviceId');
    if (deviceId) {
      await authService.logout(deviceId);
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('deviceId');
    
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    const token = localStorage.getItem('refreshToken');
    if (!token) return false;

    try {
      const { accessToken } = await authService.refreshToken(token);
      localStorage.setItem('accessToken', accessToken);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No token');
        }

        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(env.JWT_SECRET)
        );

        setUser(payload as User);
        setIsAuthenticated(true);
      } catch (error) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          await logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [logout, refreshToken]);

  const contextValue = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}