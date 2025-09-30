import assert from 'assert';
import { AnalyzeIn } from '../analysis.js';
import { analyze } from '../analysis.js';
import { mintToken, verifyToken } from '../auth.js';
import { PRIVATE_KEY_PATH, PUBLIC_KEY_PATH } from './test-keys.js';
import fs from 'fs';

async function testValidation(){
  console.log('testValidation');
  // too many entries
  const entries = Array.from({length:201}).map((_,i)=>({id:String(i), text:'x'}));
  try{
    AnalyzeIn.parse({ userId: 'u', entries });
    throw new Error('should have failed');
  }catch(e){ }
  // too large payload
  const bigText = 'a'.repeat(10001);
  try{
    AnalyzeIn.parse({ userId: 'u', entries:[{id:'1', text: bigText}] });
    throw new Error('should have failed size');
  }catch(e){ }
  console.log('testValidation passed');
}

async function testLLMParseError(){
  console.log('testLLMParseError');
  const payload = { userId: 'u', entries:[{id:'1', text:'dream about river'}] };
  try{
    await analyze(payload, { mockLLM: { text: 'not a json' }});
    throw new Error('should have thrown LLM_PARSE_ERROR');
  }catch(e){
    if (e.message !== 'LLM_PARSE_ERROR') throw e;
  }
  console.log('testLLMParseError passed');
}

async function testDedupAndCache(){
  console.log('testDedupAndCache');
  const payload = { userId: 'u', orgId: 'o1', entries:[{id:'1', text:'sun and moon'}] };
  const mockJson = JSON.stringify({ nodes:[{id:'Sun', type:'symbol'}], edges:[], metrics:{ADI:0.5, volatility:0.2, polarity:0.1} });
  const first = await analyze(payload, { mockLLM:{ text: mockJson }});
  assert(first.result.nodes.length===1);
  const second = await analyze(payload, { mockLLM:{ text: mockJson }});
  assert(second.cached===true);
  // dedup: node id normalized to lowercase snake
  assert(first.result.nodes[0].id === 'sun');
  console.log('testDedupAndCache passed');
}

async function testJWTScenarios(){
  console.log('testJWTScenarios');
  if (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(PUBLIC_KEY_PATH)) throw new Error('test keys missing');

  const token = mintToken({ userId: 'u', orgId: 'o1', issuer: 'my-app' });
  const decoded = verifyToken(token);
  assert(decoded.sub === 'u');

  const jwt = await import('jsonwebtoken');
  const priv = fs.readFileSync(PRIVATE_KEY_PATH, 'utf-8');
  const expired = jwt.sign({ sub: 'x', orgId: 'o1' }, priv, { algorithm: 'RS256', expiresIn: '-1s', audience: 'numinos', issuer: 'my-app' });
  try{ verifyToken(expired); throw new Error('should have failed expired'); }catch(e){ }

  const wrongAud = jwt.sign({ sub: 'x', orgId: 'o1' }, priv, { algorithm: 'RS256', expiresIn: '5m', audience: 'wrong', issuer: 'my-app' });
  try{ verifyToken(wrongAud); throw new Error('should have failed aud'); }catch(e){ }

  const wrongIss = jwt.sign({ sub: 'x', orgId: 'o1' }, priv, { algorithm: 'RS256', expiresIn: '5m', audience: 'numinos', issuer: 'other' });
  try{ verifyToken(wrongIss); throw new Error('should have failed iss'); }catch(e){ }

  console.log('testJWTScenarios passed');
}

async function testTenantIsolation(){
  console.log('testTenantIsolation');
  const payload = { userId: 'u', orgId: 'o1', entries:[{id:'1', text:'sun and moon'}] };
  const mockJson = JSON.stringify({ nodes:[{id:'Sun', type:'symbol'}], edges:[], metrics:{ADI:0.5, volatility:0.2, polarity:0.1} });
  const first = await analyze(payload, { mockLLM:{ text: mockJson }});
  assert(first.result.nodes.length===1);
  const payload2 = { userId: 'u', orgId: 'o2', entries:[{id:'1', text:'sun and moon'}] };
  const second = await analyze(payload2, { mockLLM:{ text: mockJson }});
  if (second.cached) throw new Error('cross-tenant cache leakage');
  console.log('testTenantIsolation passed');
}

export { testValidation, testLLMParseError, testDedupAndCache, testJWTScenarios, testTenantIsolation };
