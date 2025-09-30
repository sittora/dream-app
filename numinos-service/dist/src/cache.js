import fs from 'fs';
import path from 'path';
const DATA_DIR = path.join(process.cwd(), 'numinos-data');
if (!fs.existsSync(DATA_DIR))
    fs.mkdirSync(DATA_DIR, { recursive: true });
export function persistResult(orgId, userId, reqHash, result) {
    const key = `${orgId || 'org'}|${userId}|${reqHash}`;
    const rec = { key, updatedAt: new Date().toISOString(), result };
    fs.writeFileSync(path.join(DATA_DIR, key + '.json'), JSON.stringify(rec));
}
export function loadResult(orgId, userId, reqHash) {
    const key = `${orgId || 'org'}|${userId}|${reqHash}`;
    const p = path.join(DATA_DIR, key + '.json');
    if (!fs.existsSync(p))
        return null;
    try {
        const raw = fs.readFileSync(p, 'utf-8');
        return JSON.parse(raw);
    }
    catch (e) {
        return null;
    }
}
