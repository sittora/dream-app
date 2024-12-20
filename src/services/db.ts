import { db } from '../db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { 
  users, dreams, dreamSymbols, comments, 
  userRelations, userEngagement, pointTransactions,
  messages, notifications
} from '../db/schema';
import type { NewUser, NewDream, NewComment } from '../types';
import { createId } from '../utils/ids';

export class DatabaseService {
  // User operations
  async createUser(data: NewUser) {
    return db.insert(users).values({
      ...data,
      id: createId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
  }

  async getUserById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        dreams: true,
        followers: true,
        following: true,
      },
    });
  }

  async getUserByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  // Dream operations
  async createDream(data: NewDream) {
    const dream = await db.insert(dreams).values({
      ...data,
      id: createId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    if (data.symbols) {
      await db.insert(dreamSymbols).values(
        data.symbols.map(symbol => ({
          dreamId: dream[0].id,
          symbol: symbol.name,
          meaning: symbol.meaning,
          archetype: symbol.archetype,
          alchemicalStage: symbol.alchemicalStage,
        }))
      );
    }

    return dream[0];
  }

  async getDreamById(id: string) {
    return db.query.dreams.findFirst({
      where: eq(dreams.id, id),
      with: {
        user: true,
        symbols: true,
        comments: {
          with: {
            user: true,
          },
        },
      },
    });
  }

  async getPublicDreams(limit = 10, offset = 0) {
    return db.query.dreams.findMany({
      where: eq(dreams.visibility, 'public'),
      orderBy: desc(dreams.createdAt),
      limit,
      offset,
      with: {
        user: true,
        symbols: true,
      },
    });
  }

  // Engagement operations
  async addEngagement(userId: string, dreamId: string, type: 'like' | 'save' | 'share' | 'view') {
    await db.insert(userEngagement).values({
      userId,
      dreamId,
      type,
      createdAt: new Date(),
    });

    // Update dream counts
    await db.update(dreams)
      .set({ [type + 's']: sql`${type + 's'} + 1` })
      .where(eq(dreams.id, dreamId));
  }

  // Points system
  async addPoints(userId: string, amount: number, type: string, source: string) {
    await db.transaction(async (tx) => {
      await tx.insert(pointTransactions).values({
        userId,
        amount,
        type,
        source,
        createdAt: new Date(),
      });

      await tx.update(users)
        .set({ points: sql`points + ${amount}` })
        .where(eq(users.id, userId));
    });
  }

  // Notifications
  async createNotification(userId: string, type: string, content: string) {
    return db.insert(notifications).values({
      userId,
      type,
      content,
      createdAt: new Date(),
    });
  }

  // Messages
  async sendMessage(senderId: string, receiverId: string, content: string) {
    return db.insert(messages).values({
      senderId,
      receiverId,
      content,
      createdAt: new Date(),
    });
  }
}

export const dbService = new DatabaseService();