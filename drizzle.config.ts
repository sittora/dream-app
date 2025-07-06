import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite3',
  dbCredentials: {
    url: 'anima-insights.db',
  },
  verbose: true,
  strict: true,
} satisfies Config;