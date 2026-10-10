import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const context=vm.createContext({Intl,Date});vm.runInContext(source.slice(source.indexOf('function registrationDate'),source.indexOf('function render')),context);
test('novo urgente entra antes dos normais mantendo ordem entre prioridades iguais',()=>{context.list=[{id:1,priority:'Normal'},{id:2,priority:'Não definida'},{id:3,priority:'Urgente'},{id:4,priority:'Urgente'}];assert.equal(vm.runInContext('priorityOrder(list).map(x=>x.id).join(",")',context),'3,4,1,2');assert.equal(context.list[0].id,1);});
test('cadastro usa data de São Paulo e aceita registros antigos sem data',()=>{assert.equal(vm.runInContext('registrationDate("2026-10-11T01:00:00Z")',context),'10/10/2026');assert.equal(vm.runInContext('registrationDate("")',context),'Não informada');});
