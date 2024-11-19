import { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { jwtVerify } from 'jose';
import { authService } from '../services/auth';
import { env } from '../config';
import type { AuthContextType, User } from '../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const login = useCallback(async (email: string, password: string, mfaCode?: string) => {
    try {
      const result = await authService.login({ email, password, mfaCode });
      
      if (result.requiresMfa) {
        return { requiresMfa: true };
      }

      if (result.user) {
        setUser(result.user);
      }
      
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      sessionStorage.setItem('isAuthenticated', 'true');
      
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const deviceId = localStorage.getItem('deviceId');
      if (deviceId) {
        await authService.logout(deviceId);
      }
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('deviceId');
      sessionStorage.removeItem('isAuthenticated');
      
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    const token = localStorage.getItem('refreshToken');
    if (!token) return false;

    try {
      const { accessToken, user: refreshedUser } = await authService.refreshToken(token);
      localStorage.setItem('accessToken', accessToken);
      
      if (refreshedUser) {
        setUser(refreshedUser);
      }
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      await authService.updateUser(user.id, data);
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      throw error;
    }
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    
    try {
      await authService.deleteAccount(user.id);
      await logout();
    } catch (error) {
      throw error;
    }
  }, [user, logout]);

  const exportData = useCallback(async () => {
    if (!user) return new Blob([]);
    
    try {
      const data = await authService.exportUserData(user.id);
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    } catch (error) {
      throw error;
    }
  }, [user]);

  const socialLogin = useCallback(async (provider: 'google' | 'facebook' | 'twitter', token: string) => {
    try {
      const result = await authService.socialLogin({ provider, token });
      
      if (result.user) {
        setUser(result.user);
      }
      
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      sessionStorage.setItem('isAuthenticated', 'true');
      
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }, []);

  const sendVerificationEmail = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      await authService.sendVerificationEmail(user.email);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }, [user]);

  const verifyEmail = useCallback(async (token: string) => {
    if (!user?.email) return;
    
    try {
      await authService.verifyEmail({ email: user.email, token });
      setIsEmailVerified(true);
      setUser(prev => prev ? { ...prev, emailVerified: true } : null);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }, [user]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = sessionStorage.getItem('isAuthenticated') === 'true';
        const token = localStorage.getItem('accessToken');
        
        if (!isAuth || !token) {
          throw new Error('Not authenticated');
        }

        const { payload } = await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
        
        if (payload.sub) {
          const refreshed = await refreshToken();
          if (!refreshed) {
            throw new Error('Failed to refresh token');
          }
          setIsAuthenticated(true);
        }
      } catch (error) {
        await logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [logout, refreshToken]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 14 * 60 * 1000); // Refresh token every 14 minutes

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, refreshToken]);

  const value = {
    isAuthenticated,
    isLoading,
    user,
    isEmailVerified,
    login,
    logout,
    socialLogin,
    refreshToken,
    updateUser,
    deleteAccount,
    exportData,
    sendVerificationEmail,
    verifyEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}