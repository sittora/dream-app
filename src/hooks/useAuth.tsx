import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Lightweight JWT decoder for client-side use (no signature verification)
function safeDecodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return {};
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch (err) {
    console.warn('safeDecodeJwt failed', err);
    return {};
  }
}
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
  const [user, setUser] = useState<any>(null);

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
      try {
        // Decode token payload client-side (no secret required) to populate user state
        const payload = safeDecodeJwt(accessToken);
        setUser(payload);
        setIsAuthenticated(true);
      } catch (err) {
        // If decoding fails, still return success so caller can decide next steps
        console.warn('Failed to decode refreshed access token:', err);
      }

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
          // Try to refresh the token if access token is missing
          const refreshed = await refreshToken();
          if (!refreshed) throw new Error('No token');
          return;
        }

        // Decode token client-side without verifying signature (verification should occur on server)
        try {
          const payload = safeDecodeJwt(token);
          setUser(payload);
          setIsAuthenticated(true);
        } catch (err) {
          // If decoding fails, attempt refresh
          console.warn('Failed to decode access token:', err);
          const refreshed = await refreshToken();
          if (!refreshed) {
            throw new Error('Invalid token');
          }
          return;
        }
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