import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const seed=JSON.parse(readFileSync(new URL('../data/initial-items.json',import.meta.url),'utf8'));
for(const fail of [false,true])test(fail?'erro de gravação fica visível no formulário':'link de peça existente atualiza e continua correto após recarregar',async()=>{
  let saved=structuredClone(seed),putBody;const elements=new Map();
  const element=id=>{if(!elements.has(id))elements.set(id,{value:'',textContent:'',open:false,addEventListener(){},focus(){},reset(){},close(){this.open=false;},showModal(){this.open=true;}});return elements.get(id);};
  const context=vm.createContext({document:{getElementById:element},Intl,URL,Date,setTimeout:()=>0,clearTimeout(){},fetch:async(path,options)=>{if(options.method==='PUT'){putBody=JSON.parse(options.body);if(fail)return {ok:false,status:503,json:async()=>({error:'Falha ao gravar no armazenamento.'})};saved=structuredClone(putBody.items);}return {ok:true,json:async()=>({items:saved,revision:'revision',mode:'blob'})};}});
  vm.runInContext(source,context);await vm.runInContext('refresh()',context);vm.runInContext("openEditor('initial-0')",context);
  assert.equal(element('url').value,'');const link='https://produto.mercadolivre.com.br/MLB-123-teste-_JM?variation=1&sid=cart';element('url').value=link;
  await element('form').onsubmit({preventDefault(){}});
  assert.equal(putBody.items.length,5);assert.equal(putBody.items[0].url,link);
  if(fail){assert.equal(element('editor').open,true);assert.match(element('editor-message').textContent,/Falha ao gravar/);assert.equal(element('save-item').disabled,false);}
  else{assert.equal(element('toast').textContent,'Atualizado com sucesso!');assert.match(element('rows').innerHTML,/Ver produto ↗/);assert.match(element('rows').innerHTML,/variation=1&amp;sid=cart/);assert.equal(element('editor').open,false);await vm.runInContext('refresh()',context);vm.runInContext("openEditor('initial-0')",context);assert.equal(element('url').value,link);assert.match(element('rows').innerHTML,/variation=1&amp;sid=cart/);}
});

