import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

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
import { logger } from '../services/logger';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Decode token client-side to populate user information (server must verify tokens)
      let payload: any = {};
      try {
        payload = safeDecodeJwt(token);
      } catch (err) {
        console.warn('Failed to decode token in AuthContext:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        setIsLoading(false);
        return;
      }

      // Create a mock user from the token payload
      const mockUser: User = {
        id: payload.sub as string,
        email: (payload.email as string) || '',
        username: (payload.username as string) || '',
        profileImage: undefined,
        bio: undefined,
        socialLinks: undefined,
        dreamStats: {
          totalDreams: 0,
          publicDreams: 0,
          privateDreams: 0,
          totalLikes: 0,
          totalComments: 0,
          totalSaves: 0,
        },
        engagement: {
          followers: [],
          following: [],
          blockedUsers: [],
          notifications: [],
        },
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          privateAccount: false,
          showEngagementStats: true,
          allowMessages: 'everyone',
        },
        points: 0,
        level: 1,
        insightRank: 'Dreamer Initiate',
        friends: [],
        dreamAnalysisCount: 0,
      };
      setUser(mockUser);
    } catch (error) {
      logger.error('Token handling failed', { error });
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('token', response.accessToken);
      
      // Create a mock user for now
      const mockUser: User = {
        id: '1',
        email,
        username: email.split('@')[0],
        profileImage: undefined,
        bio: undefined,
        socialLinks: undefined,
        dreamStats: {
          totalDreams: 0,
          publicDreams: 0,
          privateDreams: 0,
          totalLikes: 0,
          totalComments: 0,
          totalSaves: 0,
        },
        engagement: {
          followers: [],
          following: [],
          blockedUsers: [],
          notifications: [],
        },
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          privateAccount: false,
          showEngagementStats: true,
          allowMessages: 'everyone',
        },
        points: 0,
        level: 1,
        insightRank: 'Dreamer Initiate',
        friends: [],
        dreamAnalysisCount: 0,
      };
      setUser(mockUser);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      await authService.register({ email, username, password });
      // After successful registration, log the user in
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};