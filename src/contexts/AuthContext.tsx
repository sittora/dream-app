import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { jwtVerify, SignJWT } from 'jose';
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
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.VITE_JWT_SECRET));
      // Create a mock user from the token payload
      const mockUser: User = {
        id: payload.sub as string,
        email: payload.email as string || '',
        username: payload.username as string || '',
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
      logger.error('Token verification failed', { error });
      localStorage.removeItem('token');
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