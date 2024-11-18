import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '../src/db/index.js';

console.log('Running migrations...');
migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrations completed.');
