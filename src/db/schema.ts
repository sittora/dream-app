import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
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
  isAIGenerated: integer('is_ai_generated', { mode: 'boolean' }).notNull().default(false),
  status: text('status', { 
    enum: ['draft', 'published', 'archived'] 
  }).notNull().default('published'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const dreamPatterns = sqliteTable('dream_patterns', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  frequency: integer('frequency').notNull().default(1),
  firstOccurrence: integer('first_occurrence', { mode: 'timestamp' }),
  lastOccurrence: integer('last_occurrence', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Community and Engagement

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  dreamId: text('dream_id').notNull().references(() => dreams.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: text('parent_id').references(() => comments.id),
  content: text('content').notNull(),
  isEdited: integer('is_edited', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
});

export const reactions = sqliteTable('reactions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetType: text('target_type', { 
    enum: ['dream', 'interpretation', 'comment'] 
  }).notNull(),
  targetId: text('target_id').notNull(),
  type: text('type', { 
    enum: ['like', 'insightful', 'resonates'] 
  }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Analytics and Insights

export const analytics = sqliteTable('analytics', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  eventDataJson: text('event_data').notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const insights = sqliteTable('insights', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { 
    enum: ['pattern', 'trend', 'recommendation'] 
  }).notNull(),
  content: text('content').notNull(),
  metadataJson: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Privacy and Security

export const userConsent = sqliteTable('user_consent', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { 
    enum: ['privacy_policy', 'terms_of_service', 'data_processing'] 
  }).notNull(),
  version: text('version').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const dataExports = sqliteTable('data_exports', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { 
    enum: ['pending', 'processing', 'completed', 'failed'] 
  }).notNull().default('pending'),
  format: text('format', { enum: ['json', 'csv'] }).notNull().default('json'),
  url: text('url'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// Define relationships
export const dbRelations = {
  users: relations(users, ({ many }) => ({
    dreams: many(dreams),
    interpretations: many(interpretations),
    comments: many(comments),
    reactions: many(reactions),
    insights: many(insights),
    analytics: many(analytics),
    dataExports: many(dataExports),
    consent: many(userConsent),
  })),

  dreams: relations(dreams, ({ one, many }) => ({
    user: one(users, { fields: [dreams.userId], references: [users.id] }),
    versions: many(dreamVersions),
    symbols: many(dreamSymbols),
    interpretations: many(interpretations),
    comments: many(comments),
    reactions: many(reactions),
  })),

  comments: relations(comments, ({ one, many }) => ({
    user: one(users, { fields: [comments.userId], references: [users.id] }),
    dream: one(dreams, { fields: [comments.dreamId], references: [dreams.id] }),
    parent: one(comments, { fields: [comments.parentId], references: [comments.id] }),
    replies: many(comments, { relationName: 'comment_replies' }),
    reactions: many(reactions),
  })),

  interpretations: relations(interpretations, ({ one, many }) => ({
    user: one(users, { fields: [interpretations.userId], references: [users.id] }),
    dream: one(dreams, { fields: [interpretations.dreamId], references: [dreams.id] }),
    reactions: many(reactions),
  })),
};