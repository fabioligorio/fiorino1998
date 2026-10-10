import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
for(const [status,message,expected] of [[401,'Senha incorreta','Senha não reconhecida'],[503,'Não foi possível acessar o arquivo. Confira o armazenamento privado e BLOB_READ_WRITE_TOKEN na Vercel.','BLOB_READ_WRITE_TOKEN']]){
test(`login exibe a causa correta para HTTP ${status}`,async()=>{const elements=new Map();const element=id=>{if(!elements.has(id))elements.set(id,{value:id==='password'?'senha-apenas-teste':'',textContent:'',open:false,addEventListener(){},close(){this.open=false;},showModal(){this.open=true;}});return elements.get(id);};const context=vm.createContext({document:{getElementById:element},Intl,URL,setTimeout:()=>0,clearTimeout(){},fetch:async()=>({ok:false,status,json:async()=>({error:message})})});vm.runInContext(source,context);await element('login-form').onsubmit({preventDefault(){}});assert.match(element('login-error').textContent,new RegExp(expected));assert.equal(element('add').disabled,true);});}
