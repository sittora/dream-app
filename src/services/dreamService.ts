import { eq, and, desc, like, sql, or } from 'drizzle-orm';
import { db } from '../db/index';
import { dreams, dreamSymbols, users, engagement } from '../db/schema';
import { logger } from './logger';
import type { Dream } from '../types';

interface CreateDreamData {
  userId: string;
  title: string;
  content: string;
  mood?: string;
  visibility: 'public' | 'private';
  symbols: string[];
  interpretation?: string;
}

interface UpdateDreamData {
  title?: string;
  content?: string;
  mood?: string;
  visibility?: 'public' | 'private';
  symbols?: string[];
  interpretation?: string;
}

interface DreamWithSymbols {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: string;
  visibility: 'public' | 'private';
  interpretation?: string;
  likes: number;
  saves: number;
  shares: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  symbols: string[];
  user?: {
    id: string;
    username: string;
    profileImage?: string;
  };
}

class DreamService {
  // Helper function to convert database dream to DreamWithSymbols
  private convertDreamToDreamWithSymbols(dream: any, symbols: string[], user?: any): DreamWithSymbols {
    return {
      id: dream.id,
      userId: dream.userId,
      title: dream.title,
      content: dream.content,
      mood: dream.mood || undefined,
      visibility: dream.visibility,
      interpretation: dream.interpretation || undefined,
      likes: dream.likes,
      saves: dream.saves,
      shares: dream.shares,
      views: dream.views,
      createdAt: dream.createdAt,
      updatedAt: dream.updatedAt,
      symbols,
      user: user ? {
        id: user.id,
        username: user.username,
        profileImage: user.profileImage || undefined,
      } : undefined,
    };
  }

  // Create a new dream
  async createDream(data: CreateDreamData): Promise<DreamWithSymbols> {
    try {
      // Validate input
      if (!data.title.trim() || !data.content.trim()) {
        throw new Error('Title and content are required');
      }

      if (data.title.length > 200) {
        throw new Error('Title must be less than 200 characters');
      }

      if (data.content.length > 10000) {
        throw new Error('Content must be less than 10,000 characters');
      }

      // Insert dream
      const [dream] = await db.insert(dreams).values({
        userId: data.userId,
        title: data.title.trim(),
        content: data.content.trim(),
        mood: data.mood?.trim(),
        visibility: data.visibility,
        interpretation: data.interpretation?.trim(),
      }).returning();

      // Insert symbols
      if (data.symbols.length > 0) {
        const symbolData = data.symbols.map(symbol => ({
          dreamId: dream.id,
          symbol: symbol.trim().toLowerCase(),
        }));

        await db.insert(dreamSymbols).values(symbolData);
      }

      // Get user info
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        profileImage: users.profileImage,
      }).from(users).where(eq(users.id, data.userId));

      // Return dream with symbols
      const dreamWithSymbols = this.convertDreamToDreamWithSymbols(dream, data.symbols, user);

      logger.info('Dream created successfully', { dreamId: dream.id, userId: data.userId });
      return dreamWithSymbols;
    } catch (error) {
      logger.error('Failed to create dream', { error, userId: data.userId });
      throw error;
    }
  }

  // Get dreams with pagination and filters
  async getDreams(options: {
    userId?: string;
    visibility?: 'public' | 'private';
    symbol?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<DreamWithSymbols[]> {
    try {
      const { userId, visibility, symbol, search, limit = 20, offset = 0 } = options;

      // Build query conditions
      const conditions = [];
      if (userId) {
        conditions.push(eq(dreams.userId, userId));
      }
      if (visibility) {
        conditions.push(eq(dreams.visibility, visibility));
      }

      // Get dreams
      let query = db.select({
        id: dreams.id,
        userId: dreams.userId,
        title: dreams.title,
        content: dreams.content,
        mood: dreams.mood,
        visibility: dreams.visibility,
        interpretation: dreams.interpretation,
        likes: dreams.likes,
        saves: dreams.saves,
        shares: dreams.shares,
        views: dreams.views,
        createdAt: dreams.createdAt,
        updatedAt: dreams.updatedAt,
      }).from(dreams);

      let whereConditions = [];
      if (conditions.length > 0) {
        whereConditions.push(and(...conditions));
      }

      if (search) {
        whereConditions.push(
          or(
            like(dreams.title, `%${search}%`),
            like(dreams.content, `%${search}%`)
          )
        );
      }

      const dreamsData = await db.select({
        id: dreams.id,
        userId: dreams.userId,
        title: dreams.title,
        content: dreams.content,
        mood: dreams.mood,
        visibility: dreams.visibility,
        interpretation: dreams.interpretation,
        likes: dreams.likes,
        saves: dreams.saves,
        shares: dreams.shares,
        views: dreams.views,
        createdAt: dreams.createdAt,
        updatedAt: dreams.updatedAt,
      }).from(dreams)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(dreams.createdAt))
        .limit(limit)
        .offset(offset);

      // Get symbols for each dream
      const dreamsWithSymbols: DreamWithSymbols[] = [];
      for (const dream of dreamsData) {
        const symbols = await db.select({ symbol: dreamSymbols.symbol })
          .from(dreamSymbols)
          .where(eq(dreamSymbols.dreamId, dream.id));

        // Filter by symbol if specified
        if (symbol && !symbols.some(s => s.symbol.includes(symbol.toLowerCase()))) {
          continue;
        }

        // Get user info
        const [user] = await db.select({
          id: users.id,
          username: users.username,
          profileImage: users.profileImage,
        }).from(users).where(eq(users.id, dream.userId));

        dreamsWithSymbols.push(this.convertDreamToDreamWithSymbols(dream, symbols.map(s => s.symbol), user));
      }

      return dreamsWithSymbols;
    } catch (error) {
      logger.error('Failed to get dreams', { error, options });
      throw error;
    }
  }

  // Get a single dream by ID
  async getDreamById(dreamId: string, userId?: string): Promise<DreamWithSymbols | null> {
    try {
      const [dream] = await db.select({
        id: dreams.id,
        userId: dreams.userId,
        title: dreams.title,
        content: dreams.content,
        mood: dreams.mood,
        visibility: dreams.visibility,
        interpretation: dreams.interpretation,
        likes: dreams.likes,
        saves: dreams.saves,
        shares: dreams.shares,
        views: dreams.views,
        createdAt: dreams.createdAt,
        updatedAt: dreams.updatedAt,
      }).from(dreams).where(eq(dreams.id, dreamId));

      if (!dream) {
        return null;
      }

      // Check visibility
      if (dream.visibility === 'private' && dream.userId !== userId) {
        return null;
      }

      // Get symbols
      const symbols = await db.select({ symbol: dreamSymbols.symbol })
        .from(dreamSymbols)
        .where(eq(dreamSymbols.dreamId, dreamId));

      // Get user info
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        profileImage: users.profileImage,
      }).from(users).where(eq(users.id, dream.userId));

      // Increment view count
      await db.update(dreams)
        .set({ views: sql`${dreams.views} + 1` })
        .where(eq(dreams.id, dreamId));

      return this.convertDreamToDreamWithSymbols(dream, symbols.map(s => s.symbol), user);
    } catch (error) {
      logger.error('Failed to get dream by ID', { error, dreamId });
      throw error;
    }
  }

  // Update a dream
  async updateDream(dreamId: string, userId: string, data: UpdateDreamData): Promise<DreamWithSymbols | null> {
    try {
      // Check if dream exists and user owns it
      const [existingDream] = await db.select()
        .from(dreams)
        .where(and(eq(dreams.id, dreamId), eq(dreams.userId, userId)));

      if (!existingDream) {
        return null;
      }

      // Validate input
      if (data.title && data.title.length > 200) {
        throw new Error('Title must be less than 200 characters');
      }

      if (data.content && data.content.length > 10000) {
        throw new Error('Content must be less than 10,000 characters');
      }

      // Update dream
      const [updatedDream] = await db.update(dreams)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(dreams.id, dreamId))
        .returning();

      // Update symbols if provided
      if (data.symbols) {
        // Delete existing symbols
        await db.delete(dreamSymbols).where(eq(dreamSymbols.dreamId, dreamId));

        // Insert new symbols
        if (data.symbols.length > 0) {
          const symbolData = data.symbols.map(symbol => ({
            dreamId,
            symbol: symbol.trim().toLowerCase(),
          }));

          await db.insert(dreamSymbols).values(symbolData);
        }
      }

      // Get updated dream with symbols
      return await this.getDreamById(dreamId, userId);
    } catch (error) {
      logger.error('Failed to update dream', { error, dreamId, userId });
      throw error;
    }
  }

  // Delete a dream
  async deleteDream(dreamId: string, userId: string): Promise<boolean> {
    try {
      const result = await db.delete(dreams)
        .where(and(eq(dreams.id, dreamId), eq(dreams.userId, userId)));

      if (result.changes > 0) {
        logger.info('Dream deleted successfully', { dreamId, userId });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to delete dream', { error, dreamId, userId });
      throw error;
    }
  }

  // Like/unlike a dream
  async toggleLike(dreamId: string, userId: string): Promise<{ liked: boolean; likes: number }> {
    try {
      // Check if user already liked the dream
      const [existingEngagement] = await db.select()
        .from(engagement)
        .where(and(
          eq(engagement.dreamId, dreamId),
          eq(engagement.userId, userId),
          eq(engagement.type, 'like')
        ));

      if (existingEngagement) {
        // Unlike
        await db.delete(engagement)
          .where(and(
            eq(engagement.dreamId, dreamId),
            eq(engagement.userId, userId),
            eq(engagement.type, 'like')
          ));

        await db.update(dreams)
          .set({ likes: sql`${dreams.likes} - 1` })
          .where(eq(dreams.id, dreamId));

        return { liked: false, likes: Math.max(0, (await this.getDreamById(dreamId))?.likes || 0) };
      } else {
        // Like
        await db.insert(engagement).values({
          userId,
          dreamId,
          type: 'like',
        });

        await db.update(dreams)
          .set({ likes: sql`${dreams.likes} + 1` })
          .where(eq(dreams.id, dreamId));

        return { liked: true, likes: (await this.getDreamById(dreamId))?.likes || 0 };
      }
    } catch (error) {
      logger.error('Failed to toggle like', { error, dreamId, userId });
      throw error;
    }
  }

  // Get dreams by symbol
  async getDreamsBySymbol(symbol: string, limit = 20): Promise<DreamWithSymbols[]> {
    try {
      const symbols = await db.select({ dreamId: dreamSymbols.dreamId })
        .from(dreamSymbols)
        .where(like(dreamSymbols.symbol, `%${symbol.toLowerCase()}%`))
        .limit(limit);

      const dreamIds = symbols.map(s => s.dreamId);
      
      if (dreamIds.length === 0) {
        return [];
      }

      const dreamsData = await db.select({
        id: dreams.id,
        userId: dreams.userId,
        title: dreams.title,
        content: dreams.content,
        mood: dreams.mood,
        visibility: dreams.visibility,
        interpretation: dreams.interpretation,
        likes: dreams.likes,
        saves: dreams.saves,
        shares: dreams.shares,
        views: dreams.views,
        createdAt: dreams.createdAt,
        updatedAt: dreams.updatedAt,
      }).from(dreams).where(sql`${dreams.id} IN (${dreamIds.join(',')})`);

      const dreamsWithSymbols: DreamWithSymbols[] = [];
      for (const dream of dreamsData) {
        const dreamSymbolsData = await db.select({ symbol: dreamSymbols.symbol })
          .from(dreamSymbols)
          .where(eq(dreamSymbols.dreamId, dream.id));

        const [user] = await db.select({
          id: users.id,
          username: users.username,
          profileImage: users.profileImage,
        }).from(users).where(eq(users.id, dream.userId));

        dreamsWithSymbols.push(this.convertDreamToDreamWithSymbols(dream, dreamSymbolsData.map(s => s.symbol), user));
      }

      return dreamsWithSymbols;
    } catch (error) {
      logger.error('Failed to get dreams by symbol', { error, symbol });
      throw error;
    }
  }
}

export const dreamService = new DreamService(); 