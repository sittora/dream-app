import { testValidation, testLLMParseError, testDedupAndCache, testJWTScenarios, testTenantIsolation } from './tests_index.js';
import './test-keys.js';

async function run(){
  try{
    await testValidation();
    await testLLMParseError();
    await testDedupAndCache();
    await testJWTScenarios();
    await testTenantIsolation();
    console.log('ALL TESTS PASSED');
    process.exit(0);
  }catch(e){
    console.error('TESTS FAILED', e);
    process.exit(2);
  }
}

run();
