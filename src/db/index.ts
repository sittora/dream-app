import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';

// Temporarily disable database for browser testing
const isBrowser = typeof window !== 'undefined';

let db: any;
let dbUtils: any;

if (isBrowser) {
  console.log('Running in browser - database disabled');
  // Mock database for browser
  db = {} as any;
  dbUtils = {
    getStats: () => ({ dreams: { count: 0 }, users: { count: 0 }, symbols: { count: 0 } }),
    optimize: () => console.log('Mock database optimized'),
    checkIntegrity: () => true,
  };
} else {
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Database file path
  const dbPath = path.join(dataDir, 'dreams.db');

  // Initialize database with persistent storage
  const sqlite = new Database(dbPath, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
  });

  // Enable foreign keys and other security features
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL');
  sqlite.pragma('cache_size = 10000');
  sqlite.pragma('temp_store = MEMORY');

  // Create database instance
  db = drizzle(sqlite, { schema });

  // Run migrations
  try {
    // Temporarily disable migrations to test rendering
    // migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Database migrations temporarily disabled');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
  }

  // Database utility functions
  dbUtils = {
    // Get database statistics
    getStats: () => {
      const stats = {
        dreams: sqlite.prepare('SELECT COUNT(*) as count FROM dreams').get() as { count: number },
        users: sqlite.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number },
        symbols: sqlite.prepare('SELECT COUNT(*) as count FROM dream_symbols').get() as { count: number },
      };
      return stats;
    },

    // Optimize database
    optimize: () => {
      sqlite.pragma('optimize');
      console.log('✅ Database optimized');
    },

    // Check database integrity
    checkIntegrity: () => {
      const result = sqlite.pragma('integrity_check') as string[];
      return result.length === 1 && result[0] === 'ok';
         },
   };
 }

// Export database and utilities
export { db, dbUtils };
export * from './schema';