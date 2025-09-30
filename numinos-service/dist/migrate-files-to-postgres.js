import fs from 'fs';
import path from 'path';
import { persistToPostgres } from './storage.js';
async function migrate() {
    const dir = path.join(process.cwd(), 'numinos-data');
    if (!fs.existsSync(dir)) {
        console.log('no numinos-data directory found, nothing to migrate');
        return;
    }
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} files to migrate`);
    let migrated = 0;
    for (const f of files) {
        try {
            const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
            const parts = rec.key.split('|');
            if (parts.length < 3)
                continue;
            const orgId = parts[0];
            const userId = parts[1];
            const reqHash = parts.slice(2).join('|');
            await persistToPostgres(orgId, userId, reqHash, rec.result);
            migrated++;
        }
        catch (e) {
            console.error('failed migrating', f, e.message || e);
        }
    }
    console.log(`Migrated ${migrated}/${files.length}`);
}
migrate().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
