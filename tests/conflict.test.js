import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const snippet=source.slice(source.indexOf('function mergePending('),source.indexOf('async function commit('));
const base=[{id:'1',url:'',name:'Borracha'},{id:'2',url:'',name:'Carpete'}];
test('conflito de revisão tenta salvar novamente sem perder alteração de outra peça',async()=>{
const next=structuredClone(base);next[0].url='https://example.com/borracha';const fresh=structuredClone(base);fresh[1].name='Carpete atualizado';let calls=0;
const context=vm.createContext({structuredClone,items:base,revision:'old',validate:x=>x,request:async(method,body)=>{calls++;if(calls===1){const error=Error();error.status=409;throw error;}if(calls===2)return {items:fresh,revision:'new'};assert.equal(body.revision,'new');assert.equal(body.items[0].url,next[0].url);assert.equal(body.items[1].name,'Carpete atualizado');return {items:body.items,revision:'saved'};}});
vm.runInContext(snippet,context);context.next=next;const result=await vm.runInContext('saveWithRevision(next)',context);assert.equal(result.revision,'saved');assert.equal(calls,3);
});
test('conflito na mesma peça não sobrescreve alterações',()=>{const context=vm.createContext({});vm.runInContext(snippet,context);context.base=base;context.next=[{...base[0],url:'https://example.com/a'},base[1]];context.current=[{...base[0],url:'https://example.com/b'},base[1]];assert.equal(vm.runInContext('mergePending(base,next,current)',context),null);});
