import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {call} from './mcp.mjs';

test('disabled, placeholder, arbitrary IDs and tools cannot call MCP',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'mcp-guard-'));const file=join(dir,'config.json');
 const old={...process.env},fetchOld=globalThis.fetch;let calls=0;
 const write=token=>writeFile(file,JSON.stringify({mcpServers:{'n8n-mcp':{url:'http://n8n:5678/mcp-server/http',headers:{Authorization:'Bearer '+token}}}}));
 globalThis.fetch=async()=>{calls++;return {ok:true,text:async()=>JSON.stringify({id:1,result:{ok:true}})};};
 try{
  process.env.N8N_MCP_CONFIG=file;delete process.env.N8N_MCP_URL;
  await write('CONFIGURE_YOUR_OWN_MCP_TOKEN');process.env.MCP_ENABLED='0';
  await assert.rejects(call('execute_workflow',{workflowId:'iR52oRyEoMWakIj9'}),e=>e.status===503);
  process.env.MCP_ENABLED='1';await assert.rejects(call('execute_workflow',{workflowId:'iR52oRyEoMWakIj9'}),e=>e.status===503);
  await write('local-test-token-for-unit-test');
  await assert.rejects(call('execute_workflow',{workflowId:'unapproved'}),e=>e.status===403);
  await assert.rejects(call('other_tool',{workflowId:'iR52oRyEoMWakIj9'}),e=>e.status===403);
  assert.equal(calls,0);
  for(const workflowId of ['iR52oRyEoMWakIj9','V4fgFJOFdFtqYUjA'])await call('execute_workflow',{workflowId});
  await call('get_workflow_execution',{workflowId:'iR52oRyEoMWakIj9',executionId:'example'});
  await assert.rejects(call('get_workflow_execution',{workflowId:'unapproved',executionId:'example'}),e=>e.status===403);
  assert.equal(calls,3);
 }finally{process.env.MCP_ENABLED=old.MCP_ENABLED??'';if(old.N8N_MCP_CONFIG===undefined)delete process.env.N8N_MCP_CONFIG;else process.env.N8N_MCP_CONFIG=old.N8N_MCP_CONFIG;if(old.N8N_MCP_URL===undefined)delete process.env.N8N_MCP_URL;else process.env.N8N_MCP_URL=old.N8N_MCP_URL;globalThis.fetch=fetchOld;await rm(dir,{recursive:true,force:true});}
});
