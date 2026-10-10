import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {validate} from '../lib/validation.js';
const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const seed=JSON.parse(readFileSync(new URL('../data/initial-items.json',import.meta.url),'utf8'));
test('compra exige custo e data; conclusão exige compra e confirmação; dados persistem',async()=>{
let saved=structuredClone(seed),writes=0;const elements=new Map();
const el=id=>{if(!elements.has(id))elements.set(id,{value:'',textContent:'',open:false,addEventListener(){},focus(){},reset(){},close(){this.open=false;},showModal(){this.open=true;}});return elements.get(id);};
const ctx=vm.createContext({document:{getElementById:el},Intl,URL,Date,setTimeout:()=>0,clearTimeout(){},fetch:async(p,o)=>{if(o.method==='PUT'){writes++;saved=validate(JSON.parse(o.body).items);}return {ok:true,json:async()=>({items:saved,revision:'r',mode:'blob'})};}});
vm.runInContext(source,ctx);await vm.runInContext('refresh()',ctx);
vm.runInContext("openEditor('initial-0')",ctx);el('status').value='Concluído';await el('form').onsubmit({preventDefault(){}});assert.equal(writes,0);assert.match(el('editor-message').textContent,/Confirme a compra/);
vm.runInContext("openEditor('initial-0','purchase')",ctx);assert.equal(el('date').value,vm.runInContext('today()',ctx));assert.equal(el('status').value,'Comprado');assert.equal(el('amount').required,true);
await el('form').onsubmit({preventDefault(){}});assert.equal(writes,0);
el('amount').value='123.45';el('date').value='2026-10-01';el('notes').value='';await el('form').onsubmit({preventDefault(){}});assert.equal(writes,1);assert.equal(saved[0].status,'Comprado');assert.equal(saved[0].amount,123.45);assert.equal(saved[0].date,'2026-10-01');assert.ok(saved[0].purchasedAt);assert.match(el('rows').innerHTML,/Marcar concluído/);
await vm.runInContext('refresh()',ctx);vm.runInContext("openEditor('initial-0','complete');ask=async()=>false",ctx);await el('form').onsubmit({preventDefault(){}});assert.equal(writes,1);assert.equal(saved[0].status,'Comprado');assert.equal(el('editor').open,true);
vm.runInContext('ask=async()=>true',ctx);await el('form').onsubmit({preventDefault(){}});assert.equal(writes,2);assert.equal(saved[0].status,'Concluído');assert.ok(saved[0].purchasedAt);assert.equal(el('toast').textContent,'Item concluído com sucesso!');
});
