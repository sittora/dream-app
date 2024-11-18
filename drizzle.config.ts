import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'db/anima-insights.db',
  },
  verbose: true,
  strict: true,
  tablesFilter: ['!sqlite_*'],
} satisfies Config;