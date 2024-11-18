import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '../utils/ids';

// Core Tables
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  mfaSecret: text('mfa_secret'),
  mfaEnabled: integer('mfa_enabled', { mode: 'boolean' }).notNull().default(false),
  profileImage: text('profile_image'),
  bio: text('bio'),
  preferencesJson: text('preferences').notNull().default('{}'),
  role: text('role', { enum: ['user', 'admin', 'moderator'] }).notNull().default('user'),
  status: text('status', { enum: ['active', 'suspended', 'deleted'] }).notNull().default('active'),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
});

export const dreams = sqliteTable('dreams', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  language: text('language').notNull().default('en'),
  mood: text('mood'),
  lucidity: integer('lucidity').notNull().default(0), // 0-10 scale
  visibility: text('visibility', { enum: ['public', 'private', 'friends'] }).notNull().default('private'),
  version: integer('version').notNull().default(1),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  metadataJson: text('metadata').notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
});

export const dreamVersions = sqliteTable('dream_versions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  dreamId: text('dream_id').notNull().references(() => dreams.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  version: integer('version').notNull(),
  changedBy: text('changed_by').notNull().references(() => users.id),
  changeReason: text('change_reason'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const dreamSymbols = sqliteTable('dream_symbols', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  dreamId: text('dream_id').notNull().references(() => dreams.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category'),
  meaning: text('meaning'),
  archetype: text('archetype'),
  alchemicalStage: text('alchemical_stage'),
  frequency: integer('frequency').notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Interpretations and Analysis
export const interpretations = sqliteTable('interpretations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  dreamId: text('dream_id').notNull().references(() => dreams.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  approach: text('approach', { 
    enum: ['jungian', 'freudian', 'gestalt', 'existential'] 
  }).notNull(),
  confidence: real('confidence'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const dreamPatterns = sqliteTable('dream_patterns', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  frequency: integer('frequency').notNull().default(1),
  lastOccurred: integer('last_occurred', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Relations
export const dbRelations = {
  users: relations(users, ({ many }) => ({
    dreams: many(dreams),
    interpretations: many(interpretations),
  })),
  dreams: relations(dreams, ({ one, many }) => ({
    user: one(users, {
      fields: [dreams.userId],
      references: [users.id],
    }),
    versions: many(dreamVersions),
    symbols: many(dreamSymbols),
    interpretations: many(interpretations),
  })),
  dreamVersions: relations(dreamVersions, ({ one }) => ({
    dream: one(dreams, {
      fields: [dreamVersions.dreamId],
      references: [dreams.id],
    }),
    changedByUser: one(users, {
      fields: [dreamVersions.changedBy],
      references: [users.id],
    }),
  })),
  dreamSymbols: relations(dreamSymbols, ({ one }) => ({
    dream: one(dreams, {
      fields: [dreamSymbols.dreamId],
      references: [dreams.id],
    }),
  })),
  interpretations: relations(interpretations, ({ one }) => ({
    dream: one(dreams, {
      fields: [interpretations.dreamId],
      references: [dreams.id],
    }),
    user: one(users, {
      fields: [interpretations.userId],
      references: [users.id],
    }),
  })),
  dreamPatterns: relations(dreamPatterns, ({ one }) => ({
    user: one(users, {
      fields: [dreamPatterns.userId],
      references: [users.id],
    }),
  })),
};
