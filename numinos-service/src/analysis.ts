import { z } from 'zod';
import { normalizeText, redactPII, mentionsMinorsSexual, simpleHash, normalizeNodeId, clamp } from './utils.js';
import { callLLM } from './llmClient.js';
import { storage } from './storage.js';

const Entry = z.object({ id: z.string(), text: z.string(), ts: z.string().optional() });

export const AnalyzeIn = z.object({
  userId: z.string(),
  orgId: z.string().optional(),
  entries: z.array(Entry).max(200),
}).refine(data => {
  const totalChars = data.entries.map(e => e.text).join(' ').length;
  return totalChars <= 10000;
}, { message: 'payload too large' });

export type AnalyzeInType = z.infer<typeof AnalyzeIn>;

export type NodeType = 'symbol'|'archetype'|'agent'|'place'|'affect';

export type GraphOut = {
  nodes: { id: string; type: NodeType; valence?: 'pos'|'neg'|'mixed'; ts?: string }[];
  edges: { source: string; target: string; type: 'cooccur'|'causal'|'ally'|'conflict'|'transform'; weight?: number; ts?: string }[];
  metrics: { ADI: number; volatility: number; polarity: number };
}

function safeJsonParse(s: string): any | null {
  try { return JSON.parse(s); } catch (e) { return null; }
}

export async function analyze(payload: AnalyzeInType, opts?: { mockLLM?: { text: string } }) : Promise<{ result: GraphOut, cached?: boolean }> {
  // Validate already done by caller, but keep safe
  const parsed = AnalyzeIn.parse(payload);

  // Preprocess entries: normalize, redact PII, check policy
  const processed = parsed.entries.map(e => ({ ...e, text: normalizeText(redactPII(e.text)) }));

  // Content filter
  const combined = processed.map(e => e.text).join('\n');
  if (mentionsMinorsSexual(combined)) {
    const empty: GraphOut = { nodes: [], edges: [], metrics: { ADI: 0, volatility: 0, polarity: 0 } };
    return { result: empty };
  }

  // caching: hash inputs and check persistence
  // compute hash and check cache scoped to org/user (orgId must come from verified token in server)
  const reqHash = simpleHash({ entries: processed.map(e => ({ id: e.id, text: e.text, ts: e.ts })) });
  const existing = await storage.load(parsed.orgId || 'org', parsed.userId, reqHash);
  if (existing) return { result: existing.result as GraphOut, cached: true };

  // Call LLM
  const userMessages = [ JSON.stringify({ entries: processed.map(e => ({ id: e.id, text: e.text, ts: e.ts })) }) ];
  const llmResp = await callLLM('compile symbolic graph', userMessages, opts?.mockLLM);

  // LLM should return strict JSON
  const parsedJson = safeJsonParse(llmResp.text);
  if (!parsedJson) throw new Error('LLM_PARSE_ERROR');

  // Basic shape check
  const out: GraphOut = { nodes: [], edges: [], metrics: { ADI: 0, volatility: 0, polarity: 0 } };
  if (Array.isArray(parsedJson.nodes)) out.nodes = parsedJson.nodes.map((n: any) => ({ ...n }));
  if (Array.isArray(parsedJson.edges)) out.edges = parsedJson.edges.map((e: any) => ({ ...e }));
  if (parsedJson.metrics) out.metrics = parsedJson.metrics;

  // Deduplicate nodes by normalized id
  const nodeMap = new Map<string, any>();
  for (const n of out.nodes) {
    const nid = normalizeNodeId(n.id);
    const existing = nodeMap.get(nid);
    if (existing) {
      // merge valence conservatively
      if (n.valence && existing.valence !== n.valence) existing.valence = 'mixed';
      if (!existing.ts && n.ts) existing.ts = n.ts;
    } else {
      nodeMap.set(nid, { ...n, id: nid });
    }
  }
  out.nodes = Array.from(nodeMap.values());

  // Normalize edges and clamp weights
  out.edges = out.edges.map(e => ({
    source: normalizeNodeId(e.source),
    target: normalizeNodeId(e.target),
    type: e.type,
    weight: clamp(typeof e.weight === 'number' ? e.weight : 1, 0, 1),
    ts: e.ts
  }));

  // Clamp metrics
  out.metrics.ADI = clamp(Number(out.metrics.ADI) || 0, 0, 1);
  out.metrics.volatility = clamp(Number(out.metrics.volatility) || 0, 0, 1);
  out.metrics.polarity = Math.max(-1, Math.min(1, Number(out.metrics.polarity) || 0));

  // Persist
  await storage.persist(parsed.orgId || 'org', parsed.userId, reqHash, out);

  return { result: out };
}
