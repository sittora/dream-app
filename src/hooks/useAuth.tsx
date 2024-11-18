import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { jwtVerify } from 'jose';
import { authService } from '../services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  login: (email: string, password: string, mfaCode?: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

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
          new TextEncoder().encode(import.meta.env.VITE_JWT_SECRET)
        );

        setUser(payload);
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

  return (
    <AuthContext.Provider 
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        refreshToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}