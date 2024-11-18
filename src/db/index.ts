import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

// Initialize database
const sqlite = new Database(process.env.DATABASE_URL || ':memory:', {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
});

// Enable foreign keys and WAL mode for better performance
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('journal_mode = WAL');

// Create database instance
export const db = drizzle(sqlite, { schema });

// Run migrations
if (process.env.NODE_ENV !== 'test') {
  migrate(db, { migrationsFolder: './drizzle' });
}

// Export schema
export * from './schema';