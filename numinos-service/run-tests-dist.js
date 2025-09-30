import assert from 'assert';
import { AnalyzeIn } from './dist/analysis.js';
import { analyze } from './dist/analysis.js';
import { mintToken, verifyToken } from './dist/auth.js';
import fs from 'fs';

async function testValidation(){
  console.log('testValidation');
  const entries = Array.from({length:201}).map((_,i)=>({id:String(i), text:'x'}));
  try{ AnalyzeIn.parse({ userId: 'u', entries }); throw new Error('should have failed'); }catch(e){}
  const bigText = 'a'.repeat(10001);
  try{ AnalyzeIn.parse({ userId: 'u', entries:[{id:'1', text: bigText}] }); throw new Error('should have failed size'); }catch(e){}
}

async function testLLMParseError(){
  console.log('testLLMParseError');
  const payload = { userId: 'u', entries:[{id:'1', text:'dream about river'}] };
  try{ await analyze(payload, { mockLLM: { text: 'not a json' }}); throw new Error('should have thrown LLM_PARSE_ERROR'); }catch(e){ if (e.message !== 'LLM_PARSE_ERROR') throw e; }
}

async function testDedupAndCache(){
  console.log('testDedupAndCache');
  const payload = { userId: 'u', orgId: 'o1', entries:[{id:'1', text:'sun and moon'}] };
  const mockJson = JSON.stringify({ nodes:[{id:'Sun', type:'symbol'}], edges:[], metrics:{ADI:0.5, volatility:0.2, polarity:0.1} });
  const first = await analyze(payload, { mockLLM:{ text: mockJson }});
  if (first.result.nodes.length!==1) throw new Error('dedup fail');
  const second = await analyze(payload, { mockLLM:{ text: mockJson }});
  if (!second.cached) throw new Error('cache not used');
}

async function testJWTScenarios(){
  console.log('testJWTScenarios');
  const privPath = './numinos-service/keys/private.pem';
  const pubPath = './numinos-service/keys/public.pem';
  if (!fs.existsSync(privPath) || !fs.existsSync(pubPath)) throw new Error('test keys missing');
  const token = mintToken({ userId: 'u', orgId: 'o1', issuer: 'my-app' });
  const decoded = verifyToken(token);
  if (decoded.sub !== 'u') throw new Error('token decode fail');
}

async function testTenantIsolation(){
  console.log('testTenantIsolation');
  const payload = { userId: 'u', orgId: 'o1', entries:[{id:'1', text:'sun and moon'}] };
  const mockJson = JSON.stringify({ nodes:[{id:'Sun', type:'symbol'}], edges:[], metrics:{ADI:0.5, volatility:0.2, polarity:0.1} });
  const first = await analyze(payload, { mockLLM:{ text: mockJson }});
  const payload2 = { userId: 'u', orgId: 'o2', entries:[{id:'1', text:'sun and moon'}] };
  const second = await analyze(payload2, { mockLLM:{ text: mockJson }});
  if (second.cached) throw new Error('cross-tenant cache leakage');
}

(async()=>{
  try{
    await import('./src/tests/test-keys.js');
    await testValidation();
    await testLLMParseError();
    await testDedupAndCache();
    await testJWTScenarios();
    await testTenantIsolation();
    console.log('ALL DIST TESTS PASSED');
    process.exit(0);
  }catch(e){ console.error('DIST TESTS FAILED', e); process.exit(2); }
})();
