import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'numinos-data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export interface PersistRecord {
  key: string; // org|user|hash
  updatedAt: string;
  result: any;
}

export function persistResult(orgId: string, userId: string, reqHash: string, result: any) {
  const key = `${orgId || 'org'}|${userId}|${reqHash}`;
  const rec: PersistRecord = { key, updatedAt: new Date().toISOString(), result };
  fs.writeFileSync(path.join(DATA_DIR, key + '.json'), JSON.stringify(rec));
}

export function loadResult(orgId: string, userId: string, reqHash: string): PersistRecord | null {
  const key = `${orgId || 'org'}|${userId}|${reqHash}`;
  const p = path.join(DATA_DIR, key + '.json');
  if (!fs.existsSync(p)) return null;
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw) as PersistRecord;
  } catch (e) {
    return null;
  }
}
