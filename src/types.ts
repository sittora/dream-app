export interface Dream {
  id: number;
  date: string;
  title: string;
  content: string;
  mood: string;
  symbols: string[];
  interpretation: string;
  visibility: 'public' | 'private';
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
  shares: number;
  saves: number;
  saved: boolean;
  engagementScore: number;
  trending?: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  replies: Reply[];
  isAnalysis: boolean;
}

export interface Reply {
  id: string;
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  bio?: string;
  socialLinks?: SocialLink[];
  dreamStats: {
    totalDreams: number;
    publicDreams: number;
    privateDreams: number;
    totalLikes: number;
    totalComments: number;
    totalSaves: number;
  };
  engagement: {
    followers: string[];
    following: string[];
    blockedUsers: string[];
    notifications: NotificationSetting[];
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    privateAccount: boolean;
    showEngagementStats: boolean;
    allowMessages: 'everyone' | 'followers' | 'none';
  };
}

export interface NotificationSetting {
  type: 'likes' | 'comments' | 'mentions' | 'follows' | 'messages';
  enabled: boolean;
  email: boolean;
  push: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: any;
}

export interface EngagementMetrics {
  views: number;
  uniqueViewers: string[];
  likeRate: number;
  commentRate: number;
  saveRate: number;
  shareRate: number;
  peakEngagementTime: string;
  demographicData?: {
    locations: Record<string, number>;
    timeZones: Record<string, number>;
  };
}