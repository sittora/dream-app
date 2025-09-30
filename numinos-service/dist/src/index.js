import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { AnalyzeIn } from './analysis.js';
import { analyze } from './analysis.js';
import { mintToken, verifyToken } from './auth.js';
import { requireHostAssertion } from './hostAuth.js';
const app = express();
// Load env
import dotenv from 'dotenv';
dotenv.config();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
app.use(pinoHttp({ logger }));
app.disable('x-powered-by');
// Security headers
app.use(helmet({
    contentSecurityPolicy: false // we'll set CSP below manually
}));
// CSP - minimal conservative settings; connect-src will be set to allowed origins
const allowedOrigins = (process.env.NUMINOS_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const cspConnect = allowedOrigins.concat([process.env.SIDECAR_ORIGIN || 'http://localhost:5789']).join(' ');
app.use(helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
        defaultSrc: ["'none'"],
        connectSrc: [cspConnect || "'self'"],
        imgSrc: ["'self'", 'data:'],
        styleSrc: ["'unsafe-inline'"],
        scriptSrc: ["'self'"],
    }
}));
// CORS allowlist
app.use(cors({
    origin: function (origin, cb) {
        if (!origin)
            return cb(null, true); // allow server-to-server
        if (allowedOrigins.length === 0)
            return cb(null, false);
        if (allowedOrigins.includes(origin))
            return cb(null, true);
        return cb(new Error('CORS not allowed'));
    }
}));
// Force HTTPS redirect when behind proxy
if (process.env.FORCE_HTTPS === 'true') {
    app.use((req, res, next) => {
        if (req.secure || req.headers['x-forwarded-proto'] === 'https')
            return next();
        res.redirect(301, 'https://' + req.headers.host + req.url);
    });
}
// HSTS
if (process.env.FORCE_HTTPS === 'true') {
    app.use(helmet.hsts({ maxAge: 60 * 60 * 24 * 30 * 6 })); // 6 months
}
// Body size limit 200KB
app.use(express.json({ limit: '200kb' }));
// IP allowlist (optional)
const ipAllowlist = (process.env.NUMINOS_IP_ALLOWLIST || '').split(',').map(s => s.trim()).filter(Boolean);
if (ipAllowlist.length > 0) {
    app.use((req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress || '';
        if (!ipAllowlist.includes(ip))
            return res.status(403).json({ message: 'IP not allowed' });
        next();
    });
}
// Rate limiter factory
const analyzeLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 60,
    keyGenerator: (req) => `${req.ip}:${req.auth?.orgId || req.body.orgId || 'anon'}:${req.auth?.sub || req.body.userId || 'anon'}`,
    standardHeaders: true,
    legacyHeaders: false
});
// Health
app.get('/healthz', (req, res) => res.json({ ok: true }));
app.get('/readyz', (req, res) => res.json({ ok: true }));
// Token minting endpoint (minimal). The host app should call this and then pass token to widget.
// Token minting endpoint: prefer host assertion (signed by host private key). If not configured, fall back to host API key for compatibility.
if (process.env.NUMINOS_HOST_PUBLIC_KEY || process.env.NUMINOS_HOST_PUBLIC_KEY_PATH) {
    app.post('/token', requireHostAssertion, (req, res) => {
        try {
            const { userId, orgId, scopes } = req.body || {};
            if (!userId)
                return res.status(400).json({ message: 'userId required' });
            const t = mintToken({ userId, orgId });
            res.json({ token: t, expires_in: 300 });
        }
        catch (e) {
            res.status(500).json({ message: 'failed to mint token' });
        }
    });
}
else {
    app.post('/token', (req, res) => {
        try {
            const { userId, orgId, scopes } = req.body || {};
            if (!userId)
                return res.status(400).json({ message: 'userId required' });
            // Require host API key header to mint tokens
            const hostKey = req.headers['x-host-api-key'] || req.headers['x-api-key'];
            if (!process.env.NUMINOS_HOST_API_KEY || hostKey !== process.env.NUMINOS_HOST_API_KEY)
                return res.status(403).json({ message: 'forbidden' });
            const t = mintToken({ userId, orgId });
            res.json({ token: t, expires_in: 300 });
        }
        catch (e) {
            res.status(500).json({ message: 'failed to mint token' });
        }
    });
}
// Admin export endpoint - requires host API key
import { storage } from './storage.js';
app.get('/export', async (req, res) => {
    const hostKey = req.headers['x-host-api-key'] || req.headers['x-api-key'];
    if (!process.env.NUMINOS_HOST_API_KEY || hostKey !== process.env.NUMINOS_HOST_API_KEY)
        return res.status(403).json({ message: 'forbidden' });
    const { userId, orgId } = req.query;
    if (!userId || !orgId)
        return res.status(400).json({ message: 'userId and orgId required' });
    try {
        const results = await storage.listByOrgUser(String(orgId), String(userId));
        res.json({ export: results });
    }
    catch (e) {
        res.status(500).json({ message: 'failed to export', err: String(e) });
    }
});
// Admin delete endpoint - requires host API key
app.delete('/data', async (req, res) => {
    const hostKey = req.headers['x-host-api-key'] || req.headers['x-api-key'];
    if (!process.env.NUMINOS_HOST_API_KEY || hostKey !== process.env.NUMINOS_HOST_API_KEY)
        return res.status(403).json({ message: 'forbidden' });
    const { userId, orgId } = req.query;
    if (!userId || !orgId)
        return res.status(400).json({ message: 'userId and orgId required' });
    try {
        const deleted = await storage.deleteByOrgUser(String(orgId), String(userId));
        res.json({ deleted });
    }
    catch (e) {
        res.status(500).json({ message: 'failed to delete', err: String(e) });
    }
});
// TTL cleanup job (runs on startup and every 24h)
function cleanupOld() {
    try {
        if (process.env.NUMINOS_NO_RETENTION === 'true')
            return;
        const ttlDays = Number(process.env.NUMINOS_TTL_DAYS || '30');
        const ms = ttlDays * 24 * 60 * 60 * 1000;
        const fs = require('fs');
        const p = require('path');
        const dir = p.join(process.cwd(), 'numinos-data');
        if (!fs.existsSync(dir))
            return;
        const now = Date.now();
        const files = fs.readdirSync(dir);
        files.forEach((f) => {
            try {
                const rec = JSON.parse(fs.readFileSync(p.join(dir, f), 'utf-8'));
                if (rec.updatedAt && (now - new Date(rec.updatedAt).getTime()) > ms)
                    fs.unlinkSync(p.join(dir, f));
            }
            catch (e) { }
        });
    }
    catch (e) { }
}
cleanupOld();
setInterval(cleanupOld, 24 * 60 * 60 * 1000);
// JWT auth middleware (Authorization: Bearer ...)
function requireAuth(req, res, next) {
    const auth = req.headers['authorization'] || '';
    if (!auth.startsWith('Bearer '))
        return res.status(401).json({ message: 'Missing bearer token' });
    const token = auth.slice('Bearer '.length);
    try {
        const decoded = verifyToken(token);
        // attach minimal auth
        req.auth = { sub: decoded.sub, orgId: decoded.orgId };
        // Never accept orgId from client without verifying against token
        next();
    }
    catch (e) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
// Protected analyze route
app.post('/analyze', requireAuth, analyzeLimiter, async (req, res) => {
    try {
        const parsed = AnalyzeIn.safeParse(req.body);
        if (!parsed.success) {
            const err = parsed.error;
            if (err.errors.some((e) => e.message === 'payload too large')) {
                return res.status(413).json({ message: 'Payload too large' });
            }
            return res.status(400).json({ message: 'Invalid request', issues: err.issues });
        }
        // Enforce tenant isolation: use orgId from token only
        parsed.data.orgId = req.auth.orgId;
        parsed.data.userId = req.auth.sub;
        const result = await analyze(parsed.data);
        // Structured log (no raw text)
        req.log.info({ event: 'analyze', userId: parsed.data.userId, orgId: parsed.data.orgId, entriesCount: parsed.data.entries.length, cached: result.cached ? true : false });
        return res.json(result.result);
    }
    catch (err) {
        if (err.message === 'LLM_PARSE_ERROR')
            return res.status(502).json({ message: 'LLM produced invalid JSON' });
        req.log.error({ event: 'error', err: String(err) });
        return res.status(500).json({ message: 'Internal error' });
    }
});
// Persist journal entries (dreams) for a user. Expects a JSON body with the dream payload.
// Authenticated via bearer token; orgId and userId are taken from the token for tenant isolation.
import { storage as persistStorage } from './storage.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
// Validation schema for incoming journal entries (dreams)
const DreamIn = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(10000),
    mood: z.string().optional(),
    symbols: z.array(z.string()).optional().default([]),
    visibility: z.enum(['public', 'private']).default('private'),
    date: z.string().optional(),
    authorId: z.string().optional(),
    authorUsername: z.string().optional(),
    createdAt: z.string().optional(),
});
const PENDING_DIR = path.join(process.cwd(), 'numinos-data', 'pending');
if (!fs.existsSync(PENDING_DIR))
    fs.mkdirSync(PENDING_DIR, { recursive: true });
async function enqueuePending(orgId, userId, payload) {
    try {
        const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.json`;
        const p = path.join(PENDING_DIR, filename);
        const rec = { orgId, userId, payload, createdAt: new Date().toISOString() };
        fs.writeFileSync(p, JSON.stringify(rec));
        reqLog('enqueue', { file: filename });
    }
    catch (e) {
        reqLog('enqueue_error', { err: String(e) });
    }
}
function reqLog(event, obj) {
    try {
        pino().info({ event, ...obj });
    }
    catch (e) { }
}
// Background worker to process pending files and try to persist them
async function processPendingQueue() {
    try {
        const files = fs.readdirSync(PENDING_DIR).filter(f => f.endsWith('.json'));
        for (const f of files) {
            const p = path.join(PENDING_DIR, f);
            try {
                const rec = JSON.parse(fs.readFileSync(p, 'utf-8'));
                const orgId = String(rec.orgId || 'org');
                const userId = String(rec.userId || 'user');
                const payload = rec.payload;
                const hash = crypto.createHash('sha256').update(JSON.stringify(payload) + (rec.createdAt || '')).digest('hex').slice(0, 20);
                await persistStorage.persist(orgId, userId, hash, payload);
                fs.unlinkSync(p);
                reqLog('pending_persisted', { file: f, orgId, userId });
            }
            catch (e) {
                // leave file; log and continue
                reqLog('pending_persist_error', { file: f, err: String(e) });
            }
        }
    }
    catch (e) {
        reqLog('pending_queue_error', { err: String(e) });
    }
}
// Kick off background worker every 10 seconds
setInterval(() => { processPendingQueue().catch(() => { }); }, 10000);
const allowUnauthJournal = process.env.NUMINOS_ALLOW_UNAUTH_JOURNAL === 'true' || process.env.NODE_ENV === 'development';
app.post('/journal', allowUnauthJournal ? async (req, res) => {
    // In unauth mode we fake minimal req.auth
    if (!req.auth)
        req.auth = { sub: req.body.authorId || 'dev-user', orgId: 'org' };
} : requireAuth, async (req, res) => {
    try {
        const orgId = req.auth.orgId || 'org';
        const userId = req.auth.sub;
        const payload = req.body;
        if (!payload)
            return res.status(400).json({ message: 'Missing payload' });
        // Validate payload
        const parsed = DreamIn.safeParse(payload);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Invalid dream payload', issues: parsed.error.issues });
        }
        // Create a short reqHash for dedup/lookup
        const hash = crypto.createHash('sha256').update(JSON.stringify(parsed.data) + Date.now().toString()).digest('hex').slice(0, 20);
        try {
            await persistStorage.persist(String(orgId), String(userId), hash, parsed.data);
            return res.json({ ok: true, key: `${orgId}|${userId}|${hash}` });
        }
        catch (e) {
            // If persistence failed (e.g., DB down), enqueue to pending folder for retry
            const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.json`;
            const p = path.join(PENDING_DIR, filename);
            fs.writeFileSync(p, JSON.stringify({ orgId, userId, payload: parsed.data, createdAt: new Date().toISOString() }));
            req.log?.warn({ event: 'journal_persist_enqueued', err: String(e), file: filename });
            return res.status(202).json({ ok: true, queued: true, key: `${orgId}|${userId}|pending:${filename}` });
        }
    }
    catch (e) {
        req.log?.error({ event: 'journal_persist_error', err: String(e) });
        return res.status(500).json({ message: 'failed to persist' });
    }
});
// GET listing endpoint for a user's persisted journal entries
app.get('/journal', allowUnauthJournal ? async (req, res) => {
    if (!req.auth)
        req.auth = { sub: req.query.userId || 'dev-user', orgId: 'org' };
} : requireAuth, async (req, res) => {
    try {
        const orgId = req.auth.orgId || 'org';
        const userId = req.auth.sub;
        const results = await persistStorage.listByOrgUser(String(orgId), String(userId));
        return res.json({ results });
    }
    catch (e) {
        req.log?.error({ event: 'journal_list_error', err: String(e) });
        return res.status(500).json({ message: 'failed to list journal entries' });
    }
});
const port = process.env.PORT ? Number(process.env.PORT) : 5789;
app.listen(port, () => logger.info('Numinos sidecar listening on http://localhost:' + port));
