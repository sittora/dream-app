import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Initialize database in memory for development
const sqlite = new Database(':memory:');

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Create database instance
export const db = drizzle(sqlite, { schema });

// Export schema
export * from './schema';