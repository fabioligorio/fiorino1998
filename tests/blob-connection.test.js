import test from 'node:test';
import assert from 'node:assert/strict';
import {connectedBlob} from '../lib/blob-connection.js';
test('conexão com prefixo usa ID sem exigir token estático',async()=>{
  const calls=[];const sdk={get:async(...args)=>calls.push(args),put:async(...args)=>calls.push(args)};
  const connection=connectedBlob(sdk,{BLOB_READ_WRITE_TOKEN_STORE_ID:'store_example'});
  await connection.get('items.json',{access:'private',useCache:false});
  await connection.put('items.json','{}',{access:'private',ifMatch:'revision'});
  assert.deepEqual(calls[0][1],{access:'private',useCache:false,storeId:'store_example'});
  assert.deepEqual(calls[1][2],{access:'private',ifMatch:'revision',storeId:'store_example'});
  assert.equal('oidcToken' in calls[0][1],false);
});
test('aceita nome padrão e mantém compatibilidade com token estático',()=>{
  const sdk={};assert.equal(connectedBlob(sdk,{BLOB_READ_WRITE_TOKEN:'test-only'}),sdk);
  assert.throws(()=>connectedBlob(sdk,{}),/não configurado/);
});
