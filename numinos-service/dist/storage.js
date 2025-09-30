import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
const DATA_DIR = path.join(process.cwd(), 'numinos-data');
if (!fs.existsSync(DATA_DIR))
    fs.mkdirSync(DATA_DIR, { recursive: true });
// File-based implementations
export async function persistToFile(orgId, userId, reqHash, result) {
    const key = `${orgId || 'org'}|${userId}|${reqHash}`;
    const rec = { key, updatedAt: new Date().toISOString(), result };
    fs.writeFileSync(path.join(DATA_DIR, key + '.json'), JSON.stringify(rec));
}
export async function loadFromFile(orgId, userId, reqHash) {
    const key = `${orgId || 'org'}|${userId}|${reqHash}`;
    const p = path.join(DATA_DIR, key + '.json');
    if (!fs.existsSync(p))
        return null;
    try {
        return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
    catch (e) {
        return null;
    }
}
export async function listByOrgUserFile(orgId, userId) {
    const prefix = `${orgId}|${userId}`;
    const files = fs.readdirSync(DATA_DIR).filter(f => f.startsWith(prefix));
    return files.map(f => {
        try {
            return JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8'));
        }
        catch (e) {
            return null;
        }
    }).filter(Boolean);
}
export async function deleteByOrgUserFile(orgId, userId) {
    const prefix = `${orgId}|${userId}`;
    const files = fs.readdirSync(DATA_DIR).filter(f => f.startsWith(prefix));
    files.forEach(f => fs.unlinkSync(path.join(DATA_DIR, f)));
    return files.length;
}
// Postgres adapter
let pool = null;
let ensured = false;
function getPool() {
    if (!pool) {
        const url = process.env.DATABASE_URL;
        if (!url)
            throw new Error('DATABASE_URL not set');
        pool = new Pool({ connectionString: url });
    }
    return pool;
}
async function ensureSchema() {
    if (ensured)
        return;
    const p = getPool();
    // create table if not exists and attempt to enable RLS/policy. Best-effort.
    await p.query(`
    CREATE TABLE IF NOT EXISTS numinos_graphs (
      org_id text NOT NULL,
      user_id text NOT NULL,
      req_hash text NOT NULL,
      payload jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (org_id, user_id, req_hash)
    );
  `);
    try {
        await p.query(`ALTER TABLE numinos_graphs ENABLE ROW LEVEL SECURITY;`);
        // Create policy if not exists - best effort, may error if exists
        await p.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_policy' AND tablename = 'numinos_graphs') THEN
          CREATE POLICY tenant_policy ON numinos_graphs USING (org_id = current_setting('request.org_id')) WITH CHECK (org_id = current_setting('request.org_id'));
        END IF;
      END$$;
    `);
    }
    catch (e) {
        // ignore policy errors (lack of permissions) - RLS should be configured by DB admin
    }
    ensured = true;
}
export async function persistToPostgres(orgId, userId, reqHash, result) {
    const client = await getPool().connect();
    try {
        await client.query('BEGIN');
        // set session var so RLS policies can use it
        await client.query('SET LOCAL request.org_id = $1', [orgId]);
        const up = await client.query(`INSERT INTO numinos_graphs (org_id, user_id, req_hash, payload, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, now())
       ON CONFLICT (org_id, user_id, req_hash) DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()`, [orgId, userId, reqHash, JSON.stringify(result)]);
        await client.query('COMMIT');
        return true;
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
}
export async function loadFromPostgres(orgId, userId, reqHash) {
    await ensureSchema();
    const client = await getPool().connect();
    try {
        await client.query('BEGIN');
        await client.query('SET LOCAL request.org_id = $1', [orgId]);
        const r = await client.query(`SELECT payload, updated_at FROM numinos_graphs WHERE org_id = $1 AND user_id = $2 AND req_hash = $3`, [orgId, userId, reqHash]);
        await client.query('COMMIT');
        if (r.rowCount === 0)
            return null;
        return { key: `${orgId}|${userId}|${reqHash}`, updatedAt: r.rows[0].updated_at, result: r.rows[0].payload };
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
}
export async function listByOrgUserPostgres(orgId, userId) {
    await ensureSchema();
    const client = await getPool().connect();
    try {
        await client.query('BEGIN');
        await client.query('SET LOCAL request.org_id = $1', [orgId]);
        const r = await client.query(`SELECT req_hash, payload, updated_at FROM numinos_graphs WHERE org_id = $1 AND user_id = $2`, [orgId, userId]);
        await client.query('COMMIT');
        return r.rows.map((row) => ({ key: `${orgId}|${userId}|${row.req_hash}`, updatedAt: row.updated_at, result: row.payload }));
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
}
export async function deleteByOrgUserPostgres(orgId, userId) {
    await ensureSchema();
    const client = await getPool().connect();
    try {
        await client.query('BEGIN');
        await client.query('SET LOCAL request.org_id = $1', [orgId]);
        const r = await client.query(`DELETE FROM numinos_graphs WHERE org_id = $1 AND user_id = $2 RETURNING req_hash`, [orgId, userId]);
        await client.query('COMMIT');
        return r.rowCount;
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
}
export const storage = {
    persist: process.env.DATABASE_URL ? persistToPostgres : persistToFile,
    load: process.env.DATABASE_URL ? loadFromPostgres : loadFromFile,
    listByOrgUser: process.env.DATABASE_URL ? listByOrgUserPostgres : listByOrgUserFile,
    deleteByOrgUser: process.env.DATABASE_URL ? deleteByOrgUserPostgres : deleteByOrgUserFile,
};
