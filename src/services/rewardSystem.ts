import { PointTransaction, PointTransactionType, RANKS } from '../types/rewards';
import { logger } from './logger';

class RewardSystem {
  private readonly POINTS = {
    DREAM_SHARE: 10,
    QUALITY_INTERPRETATION: 15,
    RECEIVED_LIKE: 2,
    STREAK_BONUS: 5,
    ACHIEVEMENT: 25,
  };

  private readonly MULTIPLIERS = {
    CONSECUTIVE_DAYS: 1.5,
    QUALITY_CONTENT: 2.0,
    COMMUNITY_FAVORITE: 1.25,
  };

  private readonly COOLDOWNS = {
    DREAM_SHARE: 24 * 60 * 60 * 1000, // 24 hours
    INTERPRETATION: 15 * 60 * 1000, // 15 minutes
  };

  async awardPoints(
    userId: string,
    type: PointTransactionType,
    source: string
  ): Promise<PointTransaction> {
    try {
      // Check cooldowns and rate limits
      if (!this.checkCooldown(userId, type)) {
        throw new Error('Action on cooldown');
      }

      // Calculate base points
      let points = this.calculateBasePoints(type);

      // Apply multipliers
      points = this.applyMultipliers(points, userId, type);

      // Create transaction
      const transaction: PointTransaction = {
        id: crypto.randomUUID(),
        userId,
        amount: points,
        type,
        source,
        timestamp: new Date().toISOString(),
      };

      // Update user's points and check for level up
      await this.updateUserPoints(userId, points);
      await this.checkLevelUp(userId);

      // Log transaction
      logger.info('Points awarded', { transaction });

      return transaction;
    } catch (error) {
      logger.error('Failed to award points', { error, userId, type });
      throw error;
    }
  }

  private calculateBasePoints(type: PointTransactionType): number {
    switch (type) {
      case 'dream_share':
        return this.POINTS.DREAM_SHARE;
      case 'interpretation':
        return this.POINTS.QUALITY_INTERPRETATION;
      case 'received_like':
        return this.POINTS.RECEIVED_LIKE;
      case 'streak_bonus':
        return this.POINTS.STREAK_BONUS;
      case 'achievement':
        return this.POINTS.ACHIEVEMENT;
      default:
        return 0;
    }
  }

  private applyMultipliers(points: number, userId: string, type: PointTransactionType): number {
    let finalPoints = points;

    // Apply streak multiplier
    if (this.hasActiveStreak(userId)) {
      finalPoints *= this.MULTIPLIERS.CONSECUTIVE_DAYS;
    }

    // Apply quality multiplier for interpretations
    if (type === 'interpretation' && this.isQualityContent(userId)) {
      finalPoints *= this.MULTIPLIERS.QUALITY_CONTENT;
    }

    // Apply community favorite multiplier
    if (this.isCommunityFavorite(userId)) {
      finalPoints *= this.MULTIPLIERS.COMMUNITY_FAVORITE;
    }

    return Math.round(finalPoints);
  }

  private async updateUserPoints(userId: string, points: number): Promise<void> {
    // Update user's points in database
    // Implementation depends on your database setup
  }

  private async checkLevelUp(userId: string): Promise<void> {
    // Get user's current points
    const currentPoints = await this.getUserPoints(userId);
    
    // Find new rank
    const newRank = RANKS.findLast(rank => currentPoints >= rank.minPoints);
    
    if (newRank) {
      // Update user's rank if changed
      await this.updateUserRank(userId, newRank);
    }
  }

  private checkCooldown(userId: string, type: PointTransactionType): boolean {
    // Implementation of cooldown checks
    return true;
  }

  private hasActiveStreak(userId: string): boolean {
    // Check if user has been active in consecutive days
    return true;
  }

  private isQualityContent(userId: string): boolean {
    // Analyze content quality based on engagement metrics
    return true;
  }

  private isCommunityFavorite(userId: string): boolean {
    // Check if user's content is consistently well-received
    return true;
  }

  private async getUserPoints(userId: string): Promise<number> {
    // Get user's current points from database
    return 0;
  }

  private async updateUserRank(userId: string, rank: typeof RANKS[number]): Promise<void> {
    // Update user's rank in database
  }
}

export const rewardSystem = new RewardSystem();