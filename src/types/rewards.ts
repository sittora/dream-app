export interface RewardSystem {
  points: number;
  level: number;
  rank: string;
  streakDays: number;
  lastActive: string;
  achievements: Achievement[];
  perks: Perk[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  cost: number;
  cooldown: number;
  lastUsed?: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: PointTransactionType;
  source: string;
  timestamp: string;
}

export type PointTransactionType =
  | 'dream_share'
  | 'interpretation'
  | 'received_like'
  | 'streak_bonus'
  | 'achievement'
  | 'perk_usage';

export const RANKS = [
  { level: 0, name: 'Dreamer Initiate', minPoints: 0 },
  { level: 5, name: 'Shadow Walker', minPoints: 100 },
  { level: 10, name: 'Mystic Voyager', minPoints: 500 },
  { level: 15, name: 'Dream Weaver', minPoints: 1000 },
  { level: 20, name: 'Archetype Oracle', minPoints: 2500 },
  { level: 25, name: 'Anima Sage', minPoints: 5000 },
  { level: 30, name: 'Collective Guardian', minPoints: 10000 },
] as const;