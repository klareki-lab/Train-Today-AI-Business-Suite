import {test} from 'node:test';
import assert from 'node:assert/strict';
import {aiFetch} from '../src/ai-guard.mjs';

test('disabled or missing key cannot make a network request',async()=>{
 const old=globalThis.fetch, oldFlag=process.env.AI_ENABLED;let calls=0;
 globalThis.fetch=async()=>{calls++;throw new Error('unexpected request');};
 try{
  for(const [flag,key] of [['0','dummy-key'],['','dummy-key'],['1',''],['1','   ']]){
   process.env.AI_ENABLED=flag;
   await assert.rejects(aiFetch('https://example.invalid',{},key),e=>e.status===503);
  }
  assert.equal(calls,0);
 }finally{globalThis.fetch=old;if(oldFlag===undefined)delete process.env.AI_ENABLED;else process.env.AI_ENABLED=oldFlag;}
});
