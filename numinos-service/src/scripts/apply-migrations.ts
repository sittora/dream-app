import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

async function applyMigrations() {
  const migrationsDir = path.join(process.cwd(), 'drizzle');
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found, skipping');
    return;
  }
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  if (!files.length) { console.log('No SQL migrations found'); return; }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL not set');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    // ensure migrations history table
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (filename text PRIMARY KEY, applied_at timestamptz DEFAULT now())`);
    const res = await client.query(`SELECT filename FROM schema_migrations`);
    const applied = new Set(res.rows.map((r:any) => r.filename));
    for (const f of files) {
      if (applied.has(f)) {
        console.log('Skipping already-applied migration', f);
        continue;
      }
      const sql = fs.readFileSync(path.join(migrationsDir, f), 'utf-8');
      console.log('Applying migration', f);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations(filename) VALUES($1)', [f]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
    console.log('Migrations applied');
  } finally {
    await client.end();
  }
}

applyMigrations().catch(e=>{ console.error(e); process.exit(1); });
