import * as schema from './schema';

// Detect browser
const isBrowser = typeof window !== 'undefined';

// Export placeholders so imports from client code don't fail
export let db: any = {} as any;
export let dbUtils: any = {
  getStats: () => ({ dreams: { count: 0 }, users: { count: 0 }, symbols: { count: 0 } }),
  optimize: () => console.log('Mock database optimized'),
  checkIntegrity: () => true,
};

if (!isBrowser) {
  // Initialize server-side DB lazily to avoid bundling Node-only modules into the client
  (async () => {
    try {
      const [{ default: Database }, { drizzle }, { migrate }, path, fs] = await Promise.all([
        import('better-sqlite3'),
        import('drizzle-orm/better-sqlite3'),
        import('drizzle-orm/better-sqlite3/migrator'),
        import('path'),
        import('fs'),
      ] as any);

      // Ensure data directory exists
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const dbPath = path.join(dataDir, 'dreams.db');

      const sqlite = new Database(dbPath, {
        verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
      });

      // Security / performance pragmas
      try {
        sqlite.pragma('foreign_keys = ON');
        sqlite.pragma('journal_mode = WAL');
        sqlite.pragma('synchronous = NORMAL');
        sqlite.pragma('cache_size = 10000');
        sqlite.pragma('temp_store = MEMORY');
      } catch (e) {
        console.warn('Failed to set some sqlite pragmas:', e);
      }

      // Create drizzle DB
      db = drizzle(sqlite, { schema });

      // Attempt migrations if available
      try {
        // migrate(db, { migrationsFolder: './drizzle' });
        console.log('✅ Database migrations temporarily disabled');
      } catch (error) {
        console.error('❌ Database migration failed:', error);
      }

      // Utilities
      dbUtils = {
        getStats: () => {
          const stats = {
            dreams: sqlite.prepare('SELECT COUNT(*) as count FROM dreams').get() as { count: number },
            users: sqlite.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number },
            symbols: sqlite.prepare('SELECT COUNT(*) as count FROM dream_symbols').get() as { count: number },
          };
          return stats;
        },
        optimize: () => {
          sqlite.pragma('optimize');
          console.log('✅ Database optimized');
        },
        checkIntegrity: () => {
          const result = sqlite.pragma('integrity_check') as string[];
          return result.length === 1 && result[0] === 'ok';
        },
      };
    } catch (err) {
      // If imports fail on server, log the error and keep placeholders
      console.error('Failed to initialize server database:', err);
    }
  })();
}

export * from './schema';