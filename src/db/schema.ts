import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '../utils/ids';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  profileImage: text('profile_image'),
  bio: text('bio'),
  mfaSecret: text('mfa_secret'),
  mfaEnabled: integer('mfa_enabled', { mode: 'boolean' }).notNull().default(false),
  points: integer('points').notNull().default(0),
  level: integer('level').notNull().default(1),
  rank: text('rank').notNull().default('Dreamer Initiate'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Dreams table
export const dreams = sqliteTable('dreams', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  mood: text('mood'),
  visibility: text('visibility', { enum: ['public', 'private'] }).notNull().default('private'),
  interpretation: text('interpretation'),
  likes: integer('likes').notNull().default(0),
  saves: integer('saves').notNull().default(0),
  shares: integer('shares').notNull().default(0),
  views: integer('views').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Dream symbols table
export const dreamSymbols = sqliteTable('dream_symbols', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  dreamId: text('dream_id').notNull().references(() => dreams.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(),
  meaning: text('meaning'),
  archetype: text('archetype'),
  alchemicalStage: text('alchemical_stage'),
});

// Comments table
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  dreamId: text('dream_id').notNull().references(() => dreams.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isAnalysis: integer('is_analysis', { mode: 'boolean' }).notNull().default(false),
  likes: integer('likes').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// User relationships table
export const relationships = sqliteTable('relationships', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  followerId: text('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: text('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'accepted', 'blocked'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// User engagement table
export const engagement = sqliteTable('engagement', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dreamId: text('dream_id').notNull().references(() => dreams.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['like', 'save', 'share', 'view'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Point transactions table
export const points = sqliteTable('points', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  type: text('type', { 
    enum: ['dream_share', 'interpretation', 'received_like', 'streak_bonus', 'achievement']
  }).notNull(),
  source: text('source').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Messages table
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: text('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { 
    enum: ['like', 'comment', 'follow', 'message', 'achievement', 'level_up']
  }).notNull(),
  content: text('content').notNull(),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Define relationships
export const dbRelations = {
  users: relations(users, ({ many }) => ({
    dreams: many(dreams),
    comments: many(comments),
    followers: many(relationships, { relationName: 'followers' }),
    following: many(relationships, { relationName: 'following' }),
    sentMessages: many(messages, { relationName: 'sent' }),
    receivedMessages: many(messages, { relationName: 'received' }),
    notifications: many(notifications),
    points: many(points),
  })),

  dreams: relations(dreams, ({ one, many }) => ({
    user: one(users, { fields: [dreams.userId], references: [users.id] }),
    symbols: many(dreamSymbols),
    comments: many(comments),
    engagement: many(engagement),
  })),
};